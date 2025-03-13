/**
 * The function weatherConditionCodes takes a weather code as input and returns the corresponding
 * weather condition.
 * @param {number} weathercode - The `weathercode` parameter is a number that represents the code for a
 * specific weather condition.
 * @returns a string representing the weather condition based on the provided weather code.
 */
function weatherConditionCodes(weathercode: number) {
  switch (weathercode) {
    case 0:
      return 'Clear Sky';
    case 1:
      return 'Mainly Clear';
    case 2:
      return 'Partly Cloudy';
    case 3:
      return 'Overcast';
    case 45:
      return 'Fog';
    case 48:
      return 'Freezing Fog';
    case 51:
      return 'Light Drizzle';
    case 53:
      return 'Moderate Drizzle';
    case 55:
      return 'Dense Drizzle';
    case 56:
      return 'Light Freezing Drizzle';
    case 57:
      return 'Dense Freezing Drizzle';
    case 61:
      return 'Slight Rain';
    case 63:
      return 'Moderate Rain';
    case 65:
      return 'Heavy Rain';
    case 66:
      return 'Light Freezing Rain';
    case 67:
      return 'Heavy Freezing Rain';
    case 71:
      return 'Slight Snowfall';
    case 73:
      return 'Moderate Snowfall';
    case 75:
      return 'Heavy Snowfall';
    case 77:
      return 'Snow Grains';
    case 80:
      return 'Slight Rain Showers';
    case 81:
      return 'Moderate Rain Showers';
    case 82:
      return 'Violent Rain Showers';
    case 85:
      return 'Slight Snow Showers';
    case 86:
      return 'Heavy Snow Showers';
    case 95:
      return 'Thunderstorm';
    case 96:
      return 'Thunderstorm with Slight Hail';
    case 99:
      return 'Thunderstorm with Heavy Hail';

    default:
      return '';
  }
}
export default weatherConditionCodes;
