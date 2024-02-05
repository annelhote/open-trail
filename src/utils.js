const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

const downloadGpx = ({ gpx, meta }) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(gpx.xmlSource)], { type: 'text/csv;charset=utf-8' }));
  link.setAttribute('download', `${meta.id}.gpx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downSampleArray = (input, period) => {
  if (period < 1 || period % 1 !== 0) {
    throw new TypeError('Period must be an integer greater than or equal to 1')
  }
  if (period === 1) {
    return [...input]
  }
  const output = []
  for (let i = 0; i < input.length; i += period) {
    output.push(input[i])
  }
  return output
}

export {
  capitalize,
  chunkArray,
  downloadGpx,
  downSampleArray,
}
