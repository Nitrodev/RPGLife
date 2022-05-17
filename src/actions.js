/** Action class that is constructed from the json data. */
class Action {
  constructor(data) {
    this.type = data.type;
    this.conditions = data.conditions;
    this.verbs = data.verbs;

    /** @type {Argument[]} */
    this.arguments = data.arguments.map(arg => new Argument(arg));
    
    this.errors = data.errors;
  }

  /**
   * Check if the action can be executed.
   * @param {string[]} args the arguments to the action
   * @returns {string} Returns an error message from actions errors, or null if the action can be executed.
   */
  canExecute(args) {
    //console.log(args);
    
    if(args.length > 0) {
      
      if(args.length == 1) {
        // If the action only needs one argument, then check if the argument
        // is valid.
        if(!this.arguments[0].isValid(args[0])) {
          return args[0] + this.errors[`invalid-${this.arguments[0].type}`];
        }
      } else {
        // Either the action needs more than one argument, or the
        // argument is two words. If the action needs more than one
        // argument, then check if the given arguments are valid.
        if(this.arguments.length > 1) {
          for(let i = 0; i < this.arguments.length; i++) {
            if(!this.arguments[i].isValid(args[i])) {
              return args[0] + this.errors[`invalid-${this.arguments[i].type}`];
            }
          }
        }

        // If the argument is two or more words, then combine the two words into one.
        // with a space in between.
        if(this.arguments.length === 1) {
          args[0] = args[0] + ' ' + args[1];

          // Check if the combined argument is valid.
          if(!this.arguments[0].isValid(args[0])) {
            return args[0] + this.errors[`invalid-${this.arguments[0].type}`];
          }
        }

      }
      
    } else if (args.length === 0 && this.conditions['needs-arguments']) {
      // If there are no arguments and the action needs arguments, 
      // then return the error message for the missing arguments
      return this.errors['missing-arguments'];
    } else {
      // If there are no arguments and the action doesn't need arguments,
      // then return null, which means the action can be executed.
      return null;
    }
  }

    
}

const ArgumentTypes = {
  "number": {
    isValid(value) {
      return !isNaN(value);
    }
  },
  "string": {
    isValid(value) {
      // If the value is a string, then it is valid
      return typeof value === "string";
    }
  },
  "direction": {
    isValid(value) {
      // If the value is a direction, then it is valid
      return value === "north" || value === "south" || value === "east" || value === "west";
    }
  },
  "place": {
    isValid(value) {
      // If the value is a places name, then it is valid
      // For now, check allow only if the place exists in the players
      // current position place.
      const place = world.getPlaceAt(player.position);
      return place.findPlace(value) != null;
    }
  },
  "item": {
    isValid(value) {
      // If the value is an item name, then it is valid
      const place = player.location || world.getPlaceAt(player.position);
      const item = place.findItem(value) || player.findItem(value);
      return item != null;
    }
  },
};

class Argument {
  constructor(data) {
    this.type = data.type;
    this.optional = data.optional;
  }

  /**
   * Check if the argument is valid.
   * @param {string} value value to check
   */
  isValid(value) {
    return ArgumentTypes[this.type].isValid(value);
  }
}