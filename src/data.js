const fs = require("fs");

function randomId(size) {
  let id = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const numCharacters = characters.length;
  for (let i = 0; i < size; i++) {
    id += characters.charAt(Math.floor(Math.random() * numCharacters));
  }
  return id;
}

function totalHit() {
  let sum = 0;
  for (let key in database) {
    sum += database[key].usage;
  }
  return sum;
}

const keyUsageLimit = 3;

class User {
  constructor(phone, name, pass = '') {
    this.phone = phone;
    this.name = name;
    this.pass = pass;

    if (!database[this.phone]) {
      database[this.phone] = {
        id: randomId(6),
        name: this.name,
        pass: this.pass,
        premium: false,
        plan: null,
        planStartDate: null,
        planEndDate: null,
        block: false,
        usage: 0,
        cash: 10,
        conversationHistory: [],
      };
    }
    fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2));
  }

  delete() {
    if (database[this.phone]) {
      delete database[this.phone];
      fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2));
    } else {
      console.error(
        `No se encontró el usuario "${this.phone}" en la base de datos`
      );
    }
  }

  static show(phone) {
    if (database[phone]) {
      return {
        number: phone,
        id: database[phone].id,
        name: database[phone].name,
        pass: database[phone].pass,
        premium: database[phone].premium,
        plan: database[phone].plan,
        planStartDate: database[phone].planStartDate,
        planEndDate: database[phone].planEndDate,
        block: database[phone].block,
        usage: database[phone].usage,
        cash: database[phone].cash,
      };
    }
  }

  static check(phone) {
    return database.hasOwnProperty(phone);
  }

  static counter(phone, properties) {
    if (database[phone]) {
      Object.keys(properties).forEach((prop) => {
        if (database[phone].hasOwnProperty(prop)) {
          database[phone][prop] += properties[prop];
        } else {
          console.log(
            `La propiedad "${prop}" que ingresó no existe en el objeto del usuario "${phone}"`
          );
        }
      });
      fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2));
    } else {
      console.log(`El usuario "${phone}" no existe en la base de datos`);
    }
  }

  static change(phone, properties) {
    Object.keys(properties).forEach((prop) => {
      database[phone][prop] = properties[prop];
    });
    fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2));
  }
  
  static addToConversationHistory(phone, role, content) {
    if (database[phone]) {
      const newMessage = { role, content, timestamp: Date.now() };
      database[phone].conversationHistory.push(newMessage);
      fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2));
    } else {
      console.log(`El usuario "${phone}" no existe en la base de datos`);
    }
  }

  static getConversationHistory(phone) {
    if (database[phone] && database[phone].conversationHistory) {
      const conversationHistory = database[phone].conversationHistory;
      const startIndex = Math.max(0, conversationHistory.length - 3);
      return conversationHistory.slice(startIndex);
    } else {
      console.log(`El usuario "${phone}" no existe en la base de datos o no tiene historial de conversaciones.`);
      return [];
    }
  }
  
  static activatePremiumPlan(phone, plan) {
    const now = new Date();
    let endDate = new Date();
    if (plan === "a") {
      endDate.setMonth(now.getMonth() + 1);
    } else if (plan === "b") {
      endDate.setMonth(now.getMonth() + 6);
    } else if (plan === "c") {
      endDate.setFullYear(now.getFullYear() + 1);
    } else {
      console.log("El plan seleccionado no es válido.");
      return;
    }
    User.change(phone, {
      premium: true,
      plan: plan,
      planStartDate: now,
      planEndDate: endDate,
      cash: 10,
    });
  }
  
  static checkPremiumPlanStatus(phone) {
    const user = database[phone];
    if (user.premium && user.plan && user.planEndDate) {
      const now = new Date();
      if (user.planEndDate < now) {
        User.change(phone, {
          premium: false,
          plan: null,
          planStartDate: null,
          planEndDate: null,
          cash: 10,
        });
      }
    }
  }
  
  static getDaysRemaining(endDate) {
    const now = new Date();
    const end = new Date(endDate);
    const diffInMs = end - now;
    const daysRemaining = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    return daysRemaining;
  }
};

module.exports = { User, totalHit };