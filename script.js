'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  type: 'Premium',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  type: 'Basic',
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
  type: 'Premium',
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
  type: 'Standard',
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//receiving movements of specific array
const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = ''; // we are basically resetting the array

  // creating the sorting mechanism, using slice to create a copy of the array as to not mutate the original array
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements; // ascending order

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal'; // if statement to decide whether it is deposit or withdrawal

    // Generates the HTML markup for a single transaction row, displaying its type (deposit/withdrawal), order number, and amount
    const html = ` 
      <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    
          <div class="movements__value">${mov}€</div>
        </div>
        `;

    //containerMovements has the class saved for ease of use, insertAdjacentHTML works by taking 2 arguements first one is a preset of where the text will go and the second is the next we want
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//displays the account balance using reduce here with arrow function implementation.
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance}€`;
};

function calcDisplaySummary(acc) {
  //Deposit total
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  //Withdrawal total
  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  // interest will work on every deposit, multiply by 20% (1.2), we use map to apply 1.2 to every element separately and then add them together using reduce
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1) //only add interest if its more than 1 euro
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
}

//Taking in array of accounts which then makes new object called acc.username there we fill in what username will be.
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLocaleLowerCase()
      .split(' ')
      .map(name => name[0]) //this is returning here
      .join('');
  });
};
createUsernames(accounts);

// console.log(containerMovements.innerHTML); //this shows all the html we created

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);

  // Display Balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

// Event Handler
let currentAccount; //We are writing a variable here cuz we will need access to it outside of this one function

btnLogin.addEventListener('click', function (e) {
  //since login is a form, it defaults to refreshing page
  e.preventDefault(); // prevents form from submitting

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  ); //we are getting the value

  //optional chaining is used to prevent an type error since anything that isnt in the object wont register.
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and Welcome Message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 1;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = ''; //reset the form to empty values
    inputLoginPin.blur(); //loses focus, no more blinking when done

    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const recieverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  // Clear inputs *before* the check so they clear no matter what
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    recieverAcc &&
    currentAccount.balance >= amount &&
    recieverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    recieverAcc.movements.push(amount);
    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);

    //Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    currentAccount.pin === Number(inputClosePin.value) &&
    currentAccount.username === inputCloseUsername.value
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    // console.log(index);

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputClosePin.value = inputCloseUsername.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted; // as we keep swtiching sorted, we become able to turn on and off the true and false state. s
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
/*
let arr = ['a', 'b', 'c', 'd', 'e',]; // remember that this is not manipulating the original in any form.


//SLICE - DOES NOT MUTATE ORIGINAL ARRAY -
console.log(arr.slice(2)); //output: Array(3) [ "c", "d", "e" ]
console.log(arr.slice(2, 4)); //output: Array [ "c", "d" ]
console.log(arr.slice(-2)); //output: Array [ "d", "e" ]
console.log(arr.slice(-1)); //output: Array [ "e" ]
console.log(arr.slice(1, -2)); //output: Array [ "b", "c" ]

// SHALLOW COPIES OF ORIGINAL ARRAY
console.log(arr.slice()); //output: Array(5) [ "a", "b", "c", "d", "e" ]
console.log([...arr]); //output: Array(5) [ "a", "b", "c", "d", "e" ]


// SPLICE - MUTATES ORIGINAL ARRAY -
// console.log(arr.splice(2)); //output: Array(3) [ "c", "d", "e" ]
arr.splice(-1); // common usecase for splice is removing last value in arr
arr.splice(1, 2); // this works by setting the number of values we want to delete for second arguement (in this case we are deleting "b" and "c" )
console.log(arr); //output: Array [ "a", "d" ]


// REVERSE - MUTATES ORIGINAL ARRAY -
arr = ['a', 'b', 'c', 'd', 'e',];
const arr2 = ['j', 'i', 'h', 'g', 'f'];
console.log(arr2.reverse()); //output: Array(5) [ "f", "g", "h", "i", "j" ]
console.log(arr2); //output: Array(5) [ "f", "g", "h", "i", "j" ]


// CONCAT - DOES NOT MUTATE ORIGINAL ARRAYS -
const letters = arr.concat(arr2);
console.log(letters); //output: Array(10) [ "a", "b", "c", "d", "e", "f", "g", "h", "i", "j" ]
console.log([...arr, ...arr2]); //output: Array(10) [ "a", "b", "c", "d", "e", "f", "g", "h", "i", "j" ]


// JOIN
console.log(letters.join('-')); //turns thing into string
//output: a-b-c-d-e-f-g-h-i-j

// AT method
const arr = [23, 11, 65];
console.log(arr.at(2)); //output: 65 - a number not an array
console.log(arr[2]); //output: 65 - a number not an array

console.log(arr[arr.length - 1]); //output 65, it will always be the last value in an array.
console.log(arr.slice(-1)[0]); //output 65, it will always be the last value in an array.
console.log(arr.at(-1)); //output 65, it will always be the last value in an array.

console.log('jonas'.at(2)); //output: n
*/

/*
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300]; //Positive values are deposits and the negative values are withdrawals from the bank
for (const [i, movement] of movements.entries()) {
  if (movement > 0) {
    console.log(`Movement ${i + 1}: You deposited ${movement}`);
  } else {
    console.log(`Movement ${i + 1}: You withrdrew ${Math.abs(movement)}`);
  }
}

// for (let i = 0; i < movements.length; i++) {
//   if (movements[i] > 0) {
//     console.log(`You deposited ${movements[i]}`);
//   } else {
//     console.log(`You withdrew ${Math.abs(movements[i])}`);
//   }
// }

//forEach is a Higher order function, this is a callback function situation
console.log('-----ForEach------');
//parameters have to be order with this in mind (first is always the current element, second element is always the current index and the third element is always the entire array we are looping over) You cannot use "break" and "continue" in a foreach loop
movements.forEach(function (mov, i, arr) {
  if (mov > 0) {
    console.log(`Movement ${i + 1}: You deposited ${mov}`);
  } else {
    console.log(`Movement ${i + 1}: You withrdrew ${Math.abs(mov)}`);
  }
});
//0: function(200)
//1: function(450)
//2: function(400)
// ...
*/

/*
//MAPS AND SETSFOREACH
const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

currencies.forEach(function (value, key, map) {
  console.log(`${key}: ${value}`);
})
// USD: United States dollar
// EUR: Euro
// GBP: Pound Sterling

//Set
const currenciesUnique = new Set(['USD', 'GBP', 'USD', 'EUR', 'EUR'])
console.log(currenciesUnique);

// THe key and the value in sets are the exact same
currenciesUnique.forEach(function (value, key, map) {
  console.log(`${key}: ${value}`);
})
  */

/*
const eurToUsd = 1.1;
// BOTH OF THESE THE SAME, mov takes in the current element (THEY BOTH RETURN)
const movementsUSD = movements.map((mov) => mov * eurToUsd);

// const movementsUSD = movements.map(function (mov) {
//   return mov * eurToUsd;
// });
console.log(movementsUSD); // does not mutate original, provides new array completely

console.log(movements);

// const movementsUSDfor = []; // completely different paradigm (philosophy) of approach towards solving the problem. The original solution is a functional paradigm (newer better coding method)
// for (const mov of movements) movementsUSDfor.push(mov * eurToUsd);
// console.log(movementsUSDfor);

const movementDescriptions = movements.map((mov, i, arr) =>
  `Movement ${i + 1}: You ${mov > 0 ? `deposited` : 'withdrew'} ${Math.abs(mov)}`)
console.log(movementDescriptions);
*/

/*
//FILTER METHOD
const deposits = movements.filter(function (mov) {
  return mov > 0;
})
console.log(deposits);

const depositsFor = [];
for (const mov of movements) if (mov > 0) depositsFor.push(mov);
console.log(depositsFor);

const withdrawals = movements.filter(mov => mov < 0)
console.log(withdrawals);
*/

/*
//REDUCE METHOD
console.log(movements);

//accumulator is like a snowball
const balance = movements.reduce(function (acc, cur, i, arr) {
  return acc + cur
}, 0); // the 0 here represents the starting value of the acculumator

console.log(balance); //output: 3840, all of the numbers added together

//trying to find the Maximum value
const max = movements.reduce((acc, mov) => {
  if (acc > mov) return acc; else return mov;
}, movements[0]);
console.log(max);
*/

/*
// METHOD CHAINING, IT ONLY WORKS IF THE METHOD RETURNS AN ARRAY.
const eurToUsd = 1.1;

const totalDepositsUSD = movements.filter(mov => mov < 0) // takes in an array, looks for boolean values to filter by positive numbers in this case, generates new array
  .map((mov, i, arr) => {
    console.log(arr); // we can check the array at each step incase code does not work properly
    return mov * eurToUsd; //we have to return here cuz codeblock
  })
  // .map(mov => mov * eurToUsd) //multiplying all the values by 1.1
  .reduce((acc, mov) => acc + mov, 0); // Accumulating

console.log(totalDepositsUSD);
*/

/*
//FIND METHOD
// first withdrawal
const firstWithdrawal = movements.find(mov => mov < 0); //works through a callback function and a condition (boolean). Returns first array only not an array
console.log(movements);
console.log(firstWithdrawal);
console.log(accounts);

const account = accounts.find(acc => acc.owner === 'Jessica Davis');
console.log(account);

// for (const acc of accounts) {
//   if (acc.owner === 'Jessica Davis') {
//     console.log(acc);
//   };
// };
*/

/*
//  FindLast and findLastIndex METHODS
console.log(movements);
const lastWithdrawal = movements.findLast(mov => mov < 0); //Its looking from the end of the array to the first.. right to left.

console.log(lastWithdrawal); //output: -130

// 'Your latest large movement was X movements ago'
const largestWithdrawal = movements.findLastIndex(mov => Math.abs(mov) > 1000);
console.log(`Your latest Large movement was ${movements.length - largestWithdrawal} movements ago`);
*/

/*
// some and every METHOD
console.log(movements);

// EQUALITY
console.log(movements.includes(-130)); //output: true, it returns a boolean

//SOME: CONDITION
const anyDeposits = movements.some(mov => mov > 0); // we are checking specifically if any movment above 0 exists.
console.log(anyDeposits); //output: true

//EVERY: CONDITION
console.log(movements.every(mov => mov > 0)); //output: false

// Separate callback
const deposit = mov => mov > 0;
console.log(movements.some(deposit));
*/

/*
// Flat and FlatMap METHOD
const arr = [[1, 2, 3], [4, 5, 6], 7, 8];
console.log([].concat(...arr)); // output: [1,2,3,4,5,6,7,8]
console.log(arr.flat());// output: [1,2,3,4,5,6,7,8]

const arrDeep = [1, 2, [1], [[[[[4]]]]]]
console.log(arrDeep.flat(5)) // the number represents how deep the array goes, how far we are willing to flatten this array basically.

// const accountMovements = accounts.map(acc => acc.movements); // we are putting all the separate movement arrays into at an array created a nested array
// console.log(accountMovements);
// const allMovements = accountMovements.flat();
// console.log(allMovements);
// const overalBalance = allMovements.reduce((acc, mov) => acc + mov, 0);
// console.log(overalBalance);

// flat
const overalBalance = accounts.map(acc => acc.movements).flat().reduce((acc, mov) => acc + mov, 0);
console.log(overalBalance);

// flatMap
const overalBalance2 = accounts.flatmap(acc => acc.movements).reduce((acc, mov) => acc + mov, 0); //flatmap only lasts 1 layer, if needs more then flat must be used.
console.log(overalBalance2);
*/

/*
// SORTING METHODS

//MUTATES THE ORIGINAL ARRAY : STRINGS
const owners = ['jonas', 'zach', 'andy', 'bertie'];
console.log(owners.sort()); // alphabetical order

// NUMBERS
console.log(movements);
// console.log(movements.sort()); // fucked up, it works by sorting strings not numbers

//return < 0, A , B (keep order)
//return > 0, B, A (Switch order)
// movements.sort((a, b) => {
//   if (a > b) return 1; // a comes after b
//   if (b > a) return -1; // a comes before b
//   // if a === b, it returns undefined (same as returning 0)
// })

// SHORTENED VERSION -- ASCENDING
movements.sort((a, b) => a - b); // can invert the order by switching a - b to b - a.

console.log(movements); // output:[ -650, -400, -130, 70, 200, 450, 1300, 3000 ]

// DESCENDING
movements.sort((a, b) => b - a);
console.log(movements); //output: [ 3000, 1300, 450, 200, 70, -130, -400, -650 ]
*/

/*
//ARRAY GROUPING
console.log(movements);
const groupedMovements = Object.groupBy(movements, movement => movement > 0 ? 'deposits' : 'withdrawals');
console.log(groupedMovements); // created an object with 2 separate arrays one called deposits with positive numbers and withdrawals with negative numbers

const groupedByActivity = Object.groupBy(accounts, account => {
  const movementCount = account.movements.length;
  if (movementCount >= 8) return 'very active';
  if (movementCount >= 4) return 'active';
  if (movementCount >= 1) return 'moderate';
  return 'inactive';
});
console.log(groupedByActivity);

// const groupedAccounts = Object.groupBy(accounts, account => account.type);

// Destructuring
const groupedAccounts = Object.groupBy(accounts, ({ type }) => type);

console.log(groupedAccounts);
*/
/*
// HOW TO CREATE AND FILL ARRAYS
const x = new Array(7); //creates an array with 7 empty elements
// x.fill(1); // Mutates the array. Its the only method that works
console.log(x); //output: Array(7) [ 1, 1, 1, 1, 1, 1, 1 ]

// we can specify a begin and end parameter
x.fill(1, 3, 5)
console.log(x); //output: Array(7) [ <3 empty slots>, 1, 1, <2 empty slots> ]

// Array.from
const y = Array.from({ length: 7 }, () => 1);
console.log(y); //output: Array(7) [ 1, 1, 1, 1, 1, 1, 1 ]

const z = Array.from({ length: 7 }, (_, i) => i + 1); //throwaway parameter
console.log(z); //output: Array(7) [ 1, 2, 3, 4, 5, 6, 7 ]

const dice = Array.from({ length: 100 }, (_, i) => i = Math.floor(Math.random() * 6) + 1);
console.log(dice);

labelBalance.addEventListener('click', function () {
  const movementsUI = Array.from(
    document.querySelectorAll('.movements__value'), // Selects all movement value elements
    el => Number(el.textContent.replace('€', ''))   // Mapping function: remove € and convert to number
  );

  console.log(movementsUI); // Logs the final array of numbers

  movementsUI = [...document.querySelectorAll(`.movements__value`)];

});
*/

/*
// Non-Destructive Alternatives: toReversed, toSorted, toSpliced, with

const reveredMov = movements.reverse() //Mutates the original array == bad

// toSorted (sort), toSpliced (splice), the to version is the non-destructive version. 

// movements[1] = 2000 // MUTATES ARRAY -- BAD
const newMovements = movements.with(1, 2000); //recieves 2 arguements, first is index second is value we want to change. DOES NOT MUTATE
console.log(newMovements); //output: Array(8) [ 1300, 2000, -130, -650, 3000, -400, 450, 200 ]
console.log(movements); //output: [ 1300, 70, -130, -650, 3000, -400, 450, 200 ]
*/

/*
// Array Method Practice

// we first gather .map to get arrays of all the movements
const bankDepositSum = accounts.flatMap(acc => acc.movements).filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0);
console.log(bankDepositSum)

// how many bank deposits with atleast 1000
// const minDeposit = accounts.flatMap(acc => acc.movements).filter(mov => mov > 1000)

// we are using reduce to set a condition
const minDeposit2 = accounts.flatMap(acc => acc.movements).reduce((count, cur) => cur >= 1000 ? ++count : count, 0);
console.log(minDeposit2)

let a = 10;
console.log(a++); //output: 10, it returns the old value
console.log(a); //output: 11

//prefixed ++ operator
console.log(++a); //output: 12, this returns immediately. It is called prefix operator

// 3.
const { deposits, withdrawals } = accounts.flatMap(acc => acc.movements).reduce((sums, cur) => {
  // cur > 0 ? sums.deposits += cur : sums.withdrawals += cur;
  sums[cur > 0 ? 'deposits' : 'withdrawals'] += cur;
  return sums;
},
  { deposits: 0, withdrawals: 0 }
)
console.log(deposits, withdrawals); //25180 -7340

//4. 
// This is a nice title - > This Is a Nice Title
const converTitleCase = function (title) {
  // a function that capitalizes first letter
  const capitalize = str => str[0].toUpperCase() + str.slice(1);

  const exception = ['is', 'a', 'an', 'the', 'but', 'and', 'or', 'on', 'in', 'with'];
  // lowercase everything first, then split it using space, we use map to create an array that checks if the word exists in exception where they just print it otherwise capitalize the first letter.
  const titleCase = title
    .toLowerCase()
    .split(' ')
    .map(word => (exception.includes(word) ? word : capitalize(word)))
    .join(' ');
  return capitalize(titleCase);

}
console.log(converTitleCase('This is a nice title'));
console.log(converTitleCase('This is a LONG TITLE but tooo long'))
console.log(converTitleCase('WE LOST YIPPEE'));
*/
