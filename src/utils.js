// Get the contents of a file (text or json)
// Use fetch to get the contents of a file
function getFileContents(filePath, type) {
  return fetch(filePath)
    .then(response => {
      if (response.ok) {
        if (type === 'json') {
          return response.json();
        } else {
          return response.text();
        }
      } else {
        throw new Error(`Could not fetch ${filePath}`);
      }
    });
}

/**
 * @param {Number} min Min
 * @param {Number} max Max
 * @returns Random number between Min and Max(exclusive)
 */
 function random(min, max) {
  let rand = Math.random();

  if (typeof min === 'undefined') {
    return rand;
  } else if (typeof max === 'undefined') {
    if (min instanceof Array) {
      return min[Math.floor(rand * min.length)];
    } else {
      return Math.floor(rand * min);
    }
  } else {
    if (min > max) {
      const tmp = min;
      min = max;
      max = tmp;
    }

    return Math.floor(rand * (max - min) + min);
  }
}

/**
 * Find out the tags type
 * @param {String} tag Tag to check type of
 * @returns {String} Type of tag
 */
function getTagType(tag) {
  for (let type in tags) {
    if (tags[type].includes(tag)) {
      return type;
    }
  }
  return null;
}

function isVowel(letter) {
  return ['a', 'e', 'i', 'o', 'u'].includes(letter);
}