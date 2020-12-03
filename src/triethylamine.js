const fs = require('fs');

const DirectManager = require('direct-manager');
const direct = require('ml-direct');

const SD = require('../../spectra-data');
const prediction = require('../predictions/triethylamine.json');
const spectra = require('../spectra/triethylamine.json');

const spectraProperties = {
  frequency: 400,
  from: 0,
  to: 10,
  lineWidth: 3,
  nbPoints: 4096,
  maxClusterSize: 8,
  output: 'xy',
};

const target = spectra.y; // Triethylamine
const directManager = new DirectManager(prediction);
const boundaries = {
  lower: [7.062, 2.49, 1.0],
  upper: [7.262, 2.57, 1.07],
};
const buildPredictionFile = directManager.tidyUpSimplifiedParameters();

const predicted = direct(
  objectiveFunction,
  boundaries.lower,
  boundaries.upper,
  { iterations: 25 },
);

// console.log(predicted);

fs.appendFileSync(`predicted-${new Date()}`, `${JSON.stringify(predicted)},`);

function objectiveFunction(parameters) {
  const testSignals = buildPredictionFile(parameters);
  const simulation = SD.NMR.fromSignals(testSignals, spectraProperties);
  simulation.setMinMax(0, 1);
  const simulated = simulation.getYData();
  let result = 0;
  for (let i = 0; i < target.length; i++) {
    result += (target[i] - simulated[i]) ** 2;
  }
  return result;
}
