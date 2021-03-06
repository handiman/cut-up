import React, { useEffect, useState } from 'react';
import { Box, Button, FormControlLabel, Grid, makeStyles, Paper, RadioGroup, Radio, Slider, TextField, Tooltip, Typography, FormGroup } from '@material-ui/core';
import ReactMarkdown from 'react-markdown';

const isLocal = 'localhost' === document.location.hostname || '127.0.0.1' == document.location.hostname;
const apiHost = () => isLocal ? 'https://localhost:5001' : 'https://henrikbecker.azurewebsites.net';

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(5),
    '& .MuiPaper-root': {
      padding: theme.spacing(2)
    },
    '& .MuiBox-root': {
      marginTop: theme.spacing(5)
    }
  }
}));

const Methods = {
  CutUpSentences: 'cut-up-sentences',
  CutUpWords: 'cut-up-words'
}

const Defaults = {
  Method: Methods.CutUpSentences,
  NumberOfSentences: 16,
  LineBreaks: 4,
  SentenceMinLength: 2,
  SentenceMaxLength: 15
}

export default () => {
  const poemistUrl = 'https://www.poemist.com/api/v1/randompoems';
  const [loadingRandomPoems, setLoadingRandomPoems] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [method, setMethod] = useState(Defaults.Method);
  const [poems, setPoems] = useState<Array<any>>([]);
  const [numberOfSentences, setNumberOfSentences] = useState(Defaults.NumberOfSentences);
  const [insertLineBreaks, setInsertLineBreaks] = useState(Defaults.LineBreaks);
  const [sentenceMinLength, setSentenceMinLength] = useState(Defaults.SentenceMinLength);
  const [sentenceMaxLength, setSentenceMaxLength] = useState(Defaults.SentenceMaxLength);
  const classes = useStyles();

  useEffect(() => {
    const ping = () => {
      console.log("Ping");
      fetch(`${apiHost()}/api/v1/ping`)
      .then(response => response.text())
      .then(response => console.log(response));
    };
    ping();
    const handle = setInterval(ping, 60000);
    return () => clearInterval(handle);
  }, []);

  const post = async (action: string) => {
    if (input) {
      var url = `${apiHost()}/lyricizer/api/v1/${action}?numberOfSentences=${numberOfSentences}&insertLineBreaks=${insertLineBreaks}&sentenceMinLength=${sentenceMinLength}&sentenceMaxLength=${sentenceMaxLength}`;
      var response = await fetch(url, {
        method: 'post',
        body: input.substring(0, Math.min(300, input.length)),
        headers: {
          'Accept': 'text/plain',
          'Content-Type': 'text/plain'
        }
      });
      return await response.text();
    }
    return '';
  }

  const cutUp = async () => {
    setGenerating(true);
    setOutput(await post(method));
    setGenerating(false);
  };

  const loadRandomPoems = async () => {
    setLoadingRandomPoems(true);
    var response = await fetch(poemistUrl);
    setPoems(await response.json());
    setLoadingRandomPoems(false);
  }

  const getRandomPoem = async () => {
    var poem = poems[Math.floor(Math.random() * poems.length)];
    return poem?.content;
  }

  useEffect(() => {
    loadRandomPoems();
  }, []);

  return (
    <Typography variant="body1" component={Box} className={classes.root}>
      <Grid container spacing={2}>
        <Grid item md sm={12}>
          <TextField
            value={input} 
            fullWidth
            multiline
            rows={15}
            variant="outlined"
            placeholder="Paste some text here and use the controls to see magic happen" />
            <Tooltip title={<>Gets a random poem from Poemist<br />{ poemistUrl }</>}>
              <Button disabled={loadingRandomPoems} fullWidth onClick={async () => setInput(await getRandomPoem())}>{ loadingRandomPoems ? 'Wait for it...' : 'Get random poem'}</Button>
            </Tooltip>
        </Grid>
        <Grid item md sm={12}>
          <RadioGroup value={method} onChange={(e: any) => setMethod(e.target.value)}>
            <FormControlLabel control={<Radio />} value={Methods.CutUpSentences} label="Re-arrange sentences in random order" />
            <FormControlLabel control={<Radio />} value={Methods.CutUpWords} label="Generate random sentences" />
          </RadioGroup>
          <FormGroup>
            <Typography variant="subtitle2" id="number-of-sentences">Number of Sentences</Typography>
            <Slider
              onChange={(_: any, value: any) => setNumberOfSentences(value)}
              step={1}
              min={1}
              max={30}
              defaultValue={15}
              getAriaValueText={(value: any) => value}
              aria-labelledby="number-of-sentences"
              valueLabelDisplay="auto"
            />
            <Typography variant="subtitle2" id="line-breaks">Linebreaks</Typography>
            <Slider
              onChange={(_: any, value: any) => setInsertLineBreaks(value)}
              step={1}
              min={1}
              max={10}
              defaultValue={4}
              getAriaValueText={(value: any) => value}
              aria-labelledby="line-breaks"
              valueLabelDisplay="auto"
            />
            <Typography variant="subtitle2" id="sentence-min-length">Sentence min length</Typography>
            <Slider
              disabled={method !== Methods.CutUpWords}
              onChange={(_: any, value: any) => setSentenceMinLength(value)}
              step={1}
              min={1}
              max={20}
              defaultValue={2}
              getAriaValueText={(value: any) => value}
              aria-labelledby="sentence-min-length"
              valueLabelDisplay="auto"
            />
            <Typography variant="subtitle2" id="sentence-max-length">Sentence max length</Typography>
            <Slider
              disabled={method !== Methods.CutUpWords}
              onChange={(_: any, value: any) => setSentenceMaxLength(value)}
              step={1}
              min={1}
              max={20}
              defaultValue={15}
              getAriaValueText={(value: any) => value}
              aria-labelledby="sentence-min-length"
              valueLabelDisplay="auto"
            />
          </FormGroup>
          <Button fullWidth disabled={generating} variant="outlined" color="secondary" onClick={cutUp}>{ generating ? 'Wait for it...' : 'Generate' }</Button>
        </Grid>
      </Grid>
      <Paper title={output ? '' : 'Watch the magic happen here'}>
        <ReactMarkdown source={output} />
      </Paper>
    </Typography >
  );
};