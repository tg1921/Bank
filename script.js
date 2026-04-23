
const account1 = {
  owner: 'Biniyam Jemal Shallo',
  username: 'BEN',
  pin: 7777,
  movements: [100, 100, 79.97, 1330, 421, 250, 305, 453],
  dates: ['TODAY', '2025-12-03', '2024-03-08', '2023-12-23', '2022-11-18', '2021-07-12', '2020-05-27', '2019-04-01'],
  interestRate: 1.2
};

const account2 = {
  owner: 'Tigist',
  username: 'TG',
  pin: 2222,
  movements: [500, -30, 500, -100, -310, -790, -150],
  dates: ['TODAY', '2025-02-26', '2024-12-25', '2023-11-30', '2022-11-01', '2021-04-25', '2020-03-10'],
  interestRate: 1.2
};
const account3 = {
  owner: 'BEZA',
  username: 'BB',
  pin: 3333,
  movements:[600,200,-300],
  dates: ['TODAY','2025-02-4','2024-02-4'],
  interestRate:1.1
};
const account4 = {
  owner: 'TIHUT',
  username: 'TT',
  pin: 4444,
  movements:[500,200,-300],
  dates: ['TODAY','2025-02-4','2024-02-4'],
  interestRate:1.1
};
const allAccounts = [account1, account2, account3, account4];

// ==================== GLOBAL VARIABLES ====================
let currentUser = null;
let movementsSorted = false;
let logoutTimer = null;
let secondsLeft = 600;

// ==================== GET HTML ELEMENTS ====================
const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const loginUser = document.getElementById('loginUser');
const loginPin = document.getElementById('loginPin');
const loginBtn = document.getElementById('loginBtn');
const welcomeMsg = document.getElementById('welcomeMsg');
const userNameSpan = document.getElementById('userName');
const displayUserSpan = document.getElementById('displayUser');
const displayPinSpan = document.getElementById('displayPin');
const balanceSpan = document.getElementById('balanceValue');
const sumInSpan = document.getElementById('sumIn');
const sumOutSpan = document.getElementById('sumOut');
const sumInterestSpan = document.getElementById('sumInterest');
const movementsList = document.getElementById('movementsList');
const sortBtn = document.getElementById('sortBtn');
const transferTo = document.getElementById('transferTo');
const transferAmount = document.getElementById('transferAmount');
const transferBtn = document.getElementById('transferBtn');
const loanAmount = document.getElementById('loanAmount');
const loanBtn = document.getElementById('loanBtn');
const closeUser = document.getElementById('closeUser');
const closePin = document.getElementById('closePin');
const closeBtn = document.getElementById('closeBtn');
const timerBox = document.getElementById('timerBox');
const currentDateSpan = document.getElementById('currentDate');

function formatMoney(value) {
  let rounded = value.toFixed(2);
  let parts = rounded.split('.');
  let integerPart = parts[0];
  let decimalPart = parts[1];
  let withCommas = '';
  let count = 0;
  for (let i = integerPart.length - 1; i >= 0; i--) {
    withCommas = integerPart[i] + withCommas;
    count++;
    if (count % 3 === 0 && i !== 0) {
      withCommas = ',' + withCommas;
    }
  }
  return '$' + withCommas + '.' + decimalPart;
}

function formatDate(dateString) {
  if (dateString === 'TODAY') return 'TODAY';
  let parts = dateString.split('-');
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

function updateDateTime() {
  let now = new Date();
  let day = now.getDate();
  let month = now.getMonth() + 1;
  let year = now.getFullYear();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  let minutesStr = minutes < 10 ? '0' + minutes : minutes;
  currentDateSpan.innerText = 'As of ' + day + '/' + month + '/' + year + ', ' + hours + ':' + minutesStr + ' ' + ampm;
}
function updateTimerDisplay() {
  let mins = Math.floor(secondsLeft / 60);
  let secs = secondsLeft % 60;
  let minsStr = mins < 10 ? '0' + mins : mins;
  let secsStr = secs < 10 ? '0' + secs : secs;
  timerBox.innerText = 'You will be logged out in ' + minsStr + ':' + secsStr;
}
function resetTimer() {
 if (logoutTimer !== null) clearInterval(logoutTimer);
  secondsLeft = 600;
  updateTimerDisplay();
  logoutTimer = setInterval(function() {
    secondsLeft--;
    updateTimerDisplay();
    if (secondsLeft <= 0) {
      clearInterval(logoutTimer);
      alert('Session expired. Please login again.');
      logoutUser();
    }
  }, 1000);
}
function logoutUser() {
  if (logoutTimer !== null) clearInterval(logoutTimer);
  currentUser = null;
  dashboard.style.display = 'none';
  loginScreen.style.display = 'block';
  movementsSorted = false;
}
// ==================== DISPLAY MOVEMENTS (FIXED) ====================
function displayMovements() {
  if (currentUser === null) return;

  let movementsCopy = [];
  let datesCopy = [];
  for (let i = 0; i < currentUser.movements.length; i++) {
    movementsCopy.push(currentUser.movements[i]);
    datesCopy.push(currentUser.dates[i]);
  }

  if (movementsSorted) {
    let combined = [];
    for (let i = 0; i < movementsCopy.length; i++) {
      combined.push({ amount: movementsCopy[i], date: datesCopy[i] });
    }
    for (let i = 0; i < combined.length - 1; i++) {
      for (let j = i + 1; j < combined.length; j++) {
        if (combined[i].amount > combined[j].amount) {
          let temp = combined[i];
          combined[i] = combined[j];
          combined[j] = temp;
        }
      }
    }
    for (let i = 0; i < combined.length; i++) {
      movementsCopy[i] = combined[i].amount;
      datesCopy[i] = combined[i].date;
    }
  }
  movementsList.innerHTML = '';
  for (let i = 0; i < movementsCopy.length; i++) {
    let amount = movementsCopy[i];
    let date = datesCopy[i];
    let type = amount > 0 ? 'deposit' : 'withdrawal';
    let amountClass = amount > 0 ? 'deposit-amount' : 'withdraw-amount';
    let sign = amount > 0 ? '+' : '';
    let absAmount = amount < 0 ? -amount : amount;
    let li = document.createElement('li');
    li.className = 'movement-item';
    if (type === 'deposit') {
      li.classList.add('deposit-item');
    } else {
      li.classList.add('withdrawal-item');
    }
    
    li.innerHTML = `
      <div>
        <div>${i+1} ${type}</div>
        <div class="movement-date">${formatDate(date)}</div>
      </div>
      <div class="movement-amount ${amountClass}">${sign}${formatMoney(absAmount)}</div>
    `;
    movementsList.appendChild(li);
  }
}
// ==================== UPDATE BALANCE AND SUMMARY ====================
function updateBalanceAndSummary() {
  if (currentUser === null) return;
  let balance = 0;
  let totalIn = 0;
  let totalOut = 0;
  for (let i = 0; i < currentUser.movements.length; i++) {
    let mov = currentUser.movements[i];
    balance = balance + mov;
    if (mov > 0) totalIn = totalIn + mov;
    else totalOut = totalOut + (-mov);
  }
  let interest = (totalIn * currentUser.interestRate) / 100;
  balanceSpan.innerText = formatMoney(balance);
  sumInSpan.innerText = formatMoney(totalIn);
  sumOutSpan.innerText = formatMoney(totalOut);
  sumInterestSpan.innerText = formatMoney(interest);
}

function refreshUI() {
  updateBalanceAndSummary();
  displayMovements();
  updateDateTime();
  resetTimer();
}

function findAccount(username) {
  for (let i = 0; i < allAccounts.length; i++) {
    if (allAccounts[i].username === username) return allAccounts[i];
  }
  return null;
}

// ==================== EVENT LISTENERS ====================
loginBtn.addEventListener('click', function() {
  let enteredUser = loginUser.value.trim().toUpperCase();
  let enteredPin = Number(loginPin.value);
  let account = findAccount(enteredUser);
  if (account !== null && account.pin === enteredPin) {
    currentUser = account;
    movementsSorted = false;
    loginScreen.style.display = 'none';
    dashboard.style.display = 'block';
 let firstName = currentUser.owner.split(' ')[0];
    userNameSpan.innerText = firstName;
    welcomeMsg.innerHTML = 'Good afternoon, <span id="userName">' + firstName + '</span>!';
    displayUserSpan.innerText = currentUser.username;
    displayPinSpan.innerText = '●●●●';
    refreshUI();
    loginUser.value = '';
    loginPin.value = '';
  } else {
    alert('Wrong username or PIN. Try BEN or TG or BB or TT');
  }
});

sortBtn.addEventListener('click', function() {
  if (currentUser === null) return;
  movementsSorted = !movementsSorted;
  displayMovements();
  resetTimer();
});

transferBtn.addEventListener('click', function() {
  if (currentUser === null) return;
  let amount = Math.floor(Number(transferAmount.value) * 100) / 100;
  let receiverName = transferTo.value.trim().toUpperCase();
  let receiver = findAccount(receiverName);
  let balance = 0;
  for (let i = 0; i < currentUser.movements.length; i++) balance += currentUser.movements[i];
  if (amount <= 0) { alert('Enter positive amount'); return; }
  if (amount > balance) { alert('Insufficient balance'); return; }
  if (!receiver) { alert('Recipient not found (BEN or TG or BB or TT)'); return; }
  if (receiver.username === currentUser.username) { alert('Cannot transfer to yourself'); return; }
  currentUser.movements.push(-amount);
  currentUser.dates.push(new Date().toISOString().slice(0,10));
  receiver.movements.push(amount);
  receiver.dates.push(new Date().toISOString().slice(0,10));
  movementsSorted = false;
  refreshUI();
  transferAmount.value = '';
  transferTo.value = '';
  alert(' Transfer successful!');
});

loanBtn.addEventListener('click', function() {
  if (currentUser === null) return;
  let loan = Math.floor(Number(loanAmount.value) * 100) / 100;
  if (loan <= 0) { alert('Enter valid loan amount'); return; }
  let hasLargeDeposit = false;
  for (let i = 0; i < currentUser.movements.length; i++) {
    if (currentUser.movements[i] > 0 && currentUser.movements[i] >= loan * 0.1) {
      hasLargeDeposit = true;
      break;
    }
  }
  if (hasLargeDeposit) {
    currentUser.movements.push(loan);
    currentUser.dates.push(new Date().toISOString().slice(0,10));
    movementsSorted = false;
    refreshUI();
    loanAmount.value = '';
    alert(' Loan of ' + formatMoney(loan) + ' approved!');
  } else {
    alert(' Loan denied. Need a deposit > 10% of loan amount.');
  }
});

closeBtn.addEventListener('click', function() {
  if (currentUser === null) return;
  let confirmUser = closeUser.value.trim().toUpperCase();
  let confirmPin = Number(closePin.value);
  if (confirmUser === currentUser.username && confirmPin === currentUser.pin) {
    let index = -1;
    for (let i = 0; i < allAccounts.length; i++) {
      if (allAccounts[i].username === currentUser.username) { index = i; break; }
    }
    if (index !== -1) allAccounts.splice(index, 1);
    alert(' Account closed. You are logged out.');
    logoutUser();
  } else {
    alert(' Invalid username or PIN.');
  }
  closeUser.value = '';
  closePin.value = '';
});
