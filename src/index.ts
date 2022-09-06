import * as readline from 'readline'; 
import fs from 'fs';

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

interface Account {
  application: string
  emails: [string]
  name: string
}

interface Person {
  applications: [string]
  emails: [string]
  name: string
}

let mergeAccounts = function (accounts: Account[]) {
  let mergedAccounts = new Array<Person>();
  let mergeList = new Set<number>();
  let seen = new Set<number>();
  for (var i = 0; i < accounts.length; i++) {
    if (!seen.has(i)) {
      let newPerson = { applications: [accounts[i].application], emails: accounts[i].emails, name: accounts[i].name } as Person;
      mergeAccountsRecurse(i, mergeList, seen, accounts, newPerson);
      mergedAccounts.push(newPerson);
      mergeList.clear();
    }
  }
  return mergedAccounts;
}

let mergeAccountsRecurse = function (index: number, mergeList: Set<number>, seen: Set<number>, accounts: Account[], person: Person) {
  accounts[index].emails.forEach(email => {
    mergeList.add(index);
    seen.add(index);
    //check if another account has this email
    for (var i = 0; i < accounts.length; i++) {
      let otherAccount = accounts[i];
      if (!seen.has(i)) {
        if (otherAccount.emails.includes(email)) {
          // Add All other emails
          otherAccount.emails?.forEach(otherEmail => {
            if (otherEmail != email) {
              person.emails.push(otherEmail);
            }
          });

          // Add other application
          if (!person.applications.includes(otherAccount.application)) {
            person.applications.push(otherAccount.application);
          }

          mergeAccountsRecurse(i, mergeList, seen, accounts, person);
        }  
      }
    }
  });
}

main(); 

function main() {
  rl.question('Paste file name or plain json or press enter to quit: ', (input) => { 
    if(input.length == 0) {
      rl.close();
      return;
    }
    let accounts;
    if (fs.existsSync(input)) {
      console.log('Parsing file %s input...', input);
      const fs = require('fs');
      let jsonData = fs.readFileSync('./' + input);
      try { 
        accounts = JSON.parse(jsonData) as Account[];
        rl.close();
      } catch (error) {
        console.log('File (%s) was not in valid JSON format.', jsonData);
        main();
        return;
      } 
    } else { 
      try { 
        accounts = JSON.parse(input) as Account[];
        rl.close();
      } catch (error) {
        console.log('Parsed input was not in valid JSON format or a file.');
        main();
        return;
      }
    }

    let result = mergeAccounts(accounts);
    console.log(JSON.stringify(result, null, 1));

  });
}