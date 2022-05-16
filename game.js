const ELTS = {
  playerName: document.getElementById('playerName'),
  playerStats: document.getElementById('playerStats'),
  playerSkills: document.getElementById('playerSkills'),
  playerInventory: document.getElementById('playerInventory'),

  gameLog: document.getElementById('gameLog'),
  inputText: document.querySelector('#inputText'),
  inputButton: document.querySelector('#inputButton'),
};

// Data
/** @type {Action[]} */
let actions = [];
let items = [];
let recipes = [];

let tags = {};
let names = {};
let localisation = {};

/** @type {World} */
let world = new World();

/** @type {Player} */
let player = new Player();

function setup() {
  getData();

  ELTS.playerName.innerHTML = `${player.name}`;

  // Generate a forest at the player's starting position
  generatePlace(player.position, 'forest');

  // Log the player's starting location
  log(`You are in a ${world.getPlaceAt(player.position).tags[0]}.`);

  updatePlayerStats();
  updatePlayerSkills();
  updatePlayerInventory();
}

function updatePlayerStats() {
  // first, clear the stats
  ELTS.playerStats.innerHTML = '';
  // then, add the title
  let title = document.createElement('p');
  title.innerHTML = 'Stats';
  title.classList.add('title');

  // then, add the stats
  let stats = document.createElement('span');
  stats.innerHTML = `Vitality: ${player.stats.vitality}<br>Strength: ${player.stats.strength}<br>Dexterity: ${player.stats.dexterity}<br>Intelligence: ${player.stats.intelligence}`;

  ELTS.playerStats.appendChild(title);
  ELTS.playerStats.appendChild(stats);
}

function updatePlayerSkills() {
  // first, clear the skills
  ELTS.playerSkills.innerHTML = '';
  
  // then, add the title
  let title = document.createElement('p');
  title.innerHTML = 'Skills';
  title.classList.add('title');

  // then, add the skills
  // each skill is a span with a tooltip
  let skills = document.createElement('span');
  skills.innerHTML = player.skills.map(skill => {
    let tooltip = document.createElement('span');
    tooltip.classList.add('tooltip');
    tooltip.innerHTML = skill.description;
    let skillEl = document.createElement('span');
    skillEl.innerHTML = skill.name;
    skillEl.appendChild(tooltip);
    return skillEl.outerHTML;
  }).join('<br>');

  ELTS.playerSkills.appendChild(title);
  ELTS.playerSkills.appendChild(skills);
  
}

function updatePlayerInventory() {
  // first, clear the inventory
  ELTS.playerInventory.innerHTML = '';

  // then, add the title
  let title = document.createElement('p');
  title.innerHTML = 'Inventory';
  title.classList.add('title');

  // then, add the inventory
  let inventory = document.createElement('span');
  inventory.innerHTML = player.inventory.map(item => {
    let tooltip = document.createElement('span');
    tooltip.classList.add('tooltip-text');
    tooltip.innerHTML = item.item.description;
    let itemEl = document.createElement('span');
    itemEl.classList.add('tooltip');
    itemEl.innerHTML = capitalize(item.item.name);
    itemEl.appendChild(tooltip);
    return itemEl.outerHTML;
  }).join('<br>');

  ELTS.playerInventory.appendChild(title);
  ELTS.playerInventory.appendChild(inventory);
}

function processCommand(command) {
  let cmd = command.split(' ');
  let verb = cmd[0];
  // Arguments are everything after the verb
  let args = cmd.slice(1);
  
  let action = actions.find(a => a.verbs.includes(verb));

  if (action) {
    // Check if the action is valid
    // Action is invalid if the function returns an error message
    let result = action.canExecute(args);
    if (result == null) {
      // If the action is valid, then execute it
      let logMsg = executeAction(action, args);
      log(logMsg);

    } else {
      // Otherwise, log the error
      log(result, 'error');
    }
  } else {
    // If the action is not found, then we can't execute it
    log(`Unknown action: ${verb}`, 'error');
  }
  
  let hr = document.createElement('hr');
  ELTS.gameLog.appendChild(hr);

}

function executeAction(action, args) {

  // Execute the action
  switch (action.type) {
    case 'search': {

      // If there are no arguments, then search the place at
      // the player's current position
      if (args.length == 0) {
        let msg = '';
        if(player.location != null) {
          msg = `You look around the ${player.location.tags[0]}.`;

          msg += `<br>${player.location.description}`;
        } else {
          // Get the place at the player's current position
          // And return the first tag from the place
          let place = world.getPlaceAt(player.position);

          msg = `You are in a ${place.tags[0]}.`;

          // If the place has a description, then add it to the message
          if (place.description) {
            msg += `<br>${place.description}`;
          }

          
        }
        return msg;
      }

      // Otherwise, search the place in the direction specified
      let direction = args[0];
      let place = world.look(player.position, direction);

      if (place) {
        return `There is a ${place.tags[0]} to the ${direction}`;
      } else {
        if (isOutside(player.position.add(Direction[direction.toUpperCase()]))) {
          return `You can't search outside the world.`;
        }

        // If there is no place in the direction
        // then let's create one and search it
        let newPlace = generatePlace(player.position.add(Direction[direction.toUpperCase()]));

        return `There is a ${newPlace.tags[0]} to the ${direction}.`;
      }
    }

    case 'move': {
      let target = args[0];

      // If target is a direction, then move the player in that direction
      if(Direction[target.toUpperCase()]) {
        let newPosition = player.position.add(Direction[target.toUpperCase()]);
        
        if (isOutside(newPosition)) {
          return `You can't move outside the world.`;
        }

        let place = world.getPlaceAt(newPosition);
        if (place) {
          log(`You move ${target}.`);
          player.move(Direction[target.toUpperCase()]);
          return `You are in a ${place.tags[0]}.`;
        } else {
          // If there is no place in the direction
          // then let's create one and move there
          let newPlace = generatePlace(newPosition);

          log(`You move ${target}.`);
          player.move(Direction[target.toUpperCase()]);
          return `You are in a ${newPlace.tags[0]}.`;
        }
      }
    }

    case 'enter': {
      let target = args[0];

      let place = world.getPlaceAt(player.position);
      let targetPlace = place.findPlace(target);

      // If the target is in the current place, then enter it
      if(targetPlace) {
        log(`You enter ${target}.`);
        player.enter(targetPlace);
        return `You are in a ${target}.`;
      } else {
        return `No such place.`;
      }

    }

    case 'exit': {
      // This doesn't need args, because the player will always exit the current place
      if(player.location) {
        player.exit();
      }

      // Return the message for the current place or the world place if the player is outside
      let place = world.getPlaceAt(player.position);
      if (place && !player.location) {
        return `You are in a ${place.tags[0]}.`;
      } else if(player.location) {
        return `You are in a ${player.location.tags[0]}.`;
      }
    }

    case 'take': {
      let target = args[0];

      let place = player.location || world.getPlaceAt(player.position);

      let item = place.findItem(target);

      if(item && item.item.tools.length == 0) {
        // If the item is found, then add it to the player's inventory
        // and subtract it from the place if it has a quantity more than 1
        let quantity = 1;
        player.take(item.item, quantity);
        if(item.quantity > 1) {
          item.quantity -= quantity;
        } else if(!item.quantity) {
          // Since the item has no quantity, then assume it is renewable
          // and don't do anything
        }

        updatePlayerInventory();
        return `You take ${target}.`;
      }
    }

    case 'study': {
      // Study an item
      // TODO: Add a way to study almost everything
      let target = args[0];

      let item = player.findItem(target);
    }

    case 'craft': {
      let target = args[0];
    }
    
  }
}

function isOutside(position) {
  return position.x < 0 || position.y < 0;
}

/**
 * Log a message to the game log.
 * @param {string} message message to log
 * @param {string} type type of message: error or info, default is info
 */
function log(message, type) {
  let elt = document.createElement('p');
  elt.innerHTML = message;
  if (type === 'error') {
    elt.classList.add('error');
  } else {
    elt.classList.add('info');
  }
  ELTS.gameLog.appendChild(elt);

  // Scroll to the bottom of the log
  ELTS.gameLog.scrollTop = ELTS.gameLog.scrollHeight;
}

// INPUT EVENTS

// Add the event listener for gameInput element
ELTS.inputText.addEventListener('keydown', function (event) {
  if (event.key === "Enter") {
    const command = ELTS.inputText.value;
    if(command.length > 0) {
      ELTS.inputText.value = '';
      log('> '+command);
      processCommand(command);
    } else {
      ELTS.inputText.value = '';
    }
  }
});

// Add the same to the send button as well
ELTS.inputButton.addEventListener('click', function (event) {
  const command = ELTS.inputText.value;
  if (command) {
    ELTS.inputText.value = "";
    log('> '+command);
    processCommand(command);
  } else {
    ELTS.inputText.focus();
  }
});

/**
 * Get all of the data from the data files.
 */
function getData() {
  // Get the actions
  getFileContents('data/actions.json', 'json')
    .then(data => {
      actions = data.map(action => new Action(action));
      console.log(`Loaded ${actions.length} actions.`);
    })
    .catch(error => {
      console.error(error);
    }
  );
  
  // Get the tags
  getFileContents('data/tags.json', 'json')
    .then(data => {
      tags = data;
      console.log(`Loaded ${Object.keys(tags).length} type(s) of tags.`);
    })
    .catch(error => {
      console.error(error);
    }
  );
  
  // Get the items
  getFileContents('data/items.json', 'json')
    .then(data => {
      // Create a new object for each item in the data
      items = data;
      console.log(`Loaded ${items.length} item(s).`);
    })
    .catch(error => {
      console.error(error);
    }
  );

  // Get the recipes
  getFileContents('data/recipes.json', 'json')
    .then(data => {
      recipes = data.map(recipe => new Recipe(recipe));
      console.log(`Loaded ${recipes.length} recipe(s).`);
    })
    .catch(error => {
      console.error(error);
    }
  );

  // Get the names from all the files in the names directory
  // First get the settlement names
  getFileContents('data/names/settlement.json', 'json')
    .then(data => {
      names = data;
      console.log(`Loaded ${names[Object.keys(names)[0]].length} settlement names.`);
    })
    .catch(error => {
      console.error(error);
    }
  );

  // Get the translations from all the files in the lang directory
  // TODO: Add support for multiple languages
  getFileContents('lang/en.json', 'json')
    .then(data => {
      localisation['en'] = data;
      console.log(`Loaded ${Object.keys(localisation).length} language(s). With ${Object.keys(localisation['en']).length} translation(s).`);
    })
    .catch(error => {
      console.error(error);
    }
  );
}