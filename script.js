class Number {
    constructor() {
        this._binary = "0";
        this._decimal = 0;
        this._bit = 1;
    }

    get binary() {
        return this._binary;
    }

    get decimal() {
        return this._decimal;
    }

    get bit() {
        return this._bit;
    }

    set binary(binary) {
        this._binary = binary;
        this._binary = "0".repeat(this._bit - this._binary.length) + this._binary;
    }
    
    set decimal(decimal) {
        this._decimal = decimal;
      
        if (this._decimal === 0) {
            this._bit = 1;
            this._binary = "0";
            return;
        }
      
        let count = 0;
        let temp = Math.abs(this._decimal);
      
        while (temp !== 0) {
            count++;
            temp = temp >> 1;
        }
      
        this._bit = count;
        this._binary = Math.abs(this._decimal).toString(2);
    }    
      
    set bit(bit) {
        let diff = bit - this._bit;
        if (diff > 0) {
            this._binary = "0".repeat(bit - this._bit) + this._binary;
        } else if (diff < 0) {
            this._binary = this._binary.substring(-diff);
        }
        this._bit = bit;
        if (this._decimal < 0) {
            this._binary = twosComplement(this._binary);
        }
    }
}

const multiplicand = new Number();
const multiplier = new Number();
const previousMultiplier = new Number();
const accumulator = new Number();
let maxBit = 1;
const bitEl = document.getElementById("bit");
const multiplicandInputEl = document.getElementById("input-multiplicand");
const multiplierInputEl = document.getElementById("input-multiplier");
const table = document.getElementById("table");
const nostepEl = document.getElementById("no-step");
const concateEl = document.getElementById("concate");
const twosEl = document.getElementById("twos");
const answerEl = document.getElementById("answer-text");

const handleMultiplicandInput = () => {
    const value = multiplicandInputEl.value;
    if (value > 2147483647 || value < -2147483648) {
        multiplicandInputEl.setCustomValidity("Number must be between -2147483648 and 2147483647");
        multiplicandInputEl.reportValidity();
        return;
    }
    multiplicand.decimal = value === "" ? 0 : value;
    multiplier.decimal = multiplierInputEl.value === "" ? 0 : multiplierInputEl.value;
    updateValues();
};

const handleMultiplierInput = () => {
    const value = multiplierInputEl.value;
    if (value > 2147483647 || value < -2147483648) {
        multiplierInputEl.setCustomValidity("Number must be between -2147483648 and 2147483647");
        multiplierInputEl.reportValidity();
        return;
    }
    multiplier.decimal = value === "" ? 0 : value;
    multiplicand.decimal = multiplicandInputEl.value === "" ? 0 : multiplicandInputEl.value;
    updateValues();
};

const updateValues = () => {
    maxBit = calculateBitsNeeded(multiplicand.decimal, multiplier.decimal);
    multiplicand.bit = maxBit;
    multiplier.bit = maxBit;
    bitEl.textContent = maxBit;
    accumulator.decimal = 0;
    previousMultiplier.decimal = 0;
    accumulator.bit = maxBit;
    generateAnswer();
};

multiplicandInputEl.addEventListener("input", handleMultiplicandInput);
multiplierInputEl.addEventListener("input", handleMultiplierInput);

const addBinary = (a, b) => {
    let bit = a.length;
    let carry = 0;
    let result = "";
  
    const arrA = a.split("");
    const arrB = b.split("");
  
    while (arrA.length > 0 || arrB.length > 0 || carry > 0) {
        const digitA = arrA.length > 0 ? parseInt(arrA.pop()) : 0;
        const digitB = arrB.length > 0 ? parseInt(arrB.pop()) : 0;
    
        const sum = digitA + digitB + carry;
    
        carry = sum >= 2 ? 1 : 0;
        const resultDigit = sum % 2;
    
        result = resultDigit + result;
    }
    if (result.length > bit) {
        return result.substring(1);
    }
    return result;
};

const subtractBinary = (a, b) => {
    b = twosComplement(b);
    return addBinary(a, b);
};

const generateAnswer = () => {
    clearTable();
    createInitialRow();

    for (let i = 1; i <= maxBit; i++) {
        let multiplierLastBit = multiplier.binary[multiplier.binary.length - 1];
        if (multiplierLastBit === "1" && previousMultiplier.binary === "0") {
            accumulator.binary = subtractBinary(accumulator.binary, multiplicand.binary);
            createTableRow(accumulator.binary, multiplier.binary, previousMultiplier.binary, multiplicand.binary, "A = A - M");
        } else if (multiplierLastBit === "0" && previousMultiplier.binary === "1") {
            accumulator.binary = addBinary(accumulator.binary, multiplicand.binary);
            createTableRow(accumulator.binary, multiplier.binary, previousMultiplier.binary, multiplicand.binary, "A = A + M");
        }

        shiftRight();
    }

    let answer = accumulator.binary + multiplier.binary;
    concateEl.textContent = "Concatenate A and Q to get the answer: " + answer;

    if (answer[0] === "1" && !(multiplicand.decimal < 0 && multiplier.decimal > 0 || multiplicand.decimal > 0 && multiplier.decimal < 0)) {
        answer = twosComplement(answer);
        twosEl.textContent = "The answer should be positive, convert to two's complement: " + answer;
    }

    answerEl.textContent = "The answer is: " + binaryToDecimal(answer);
};

const createInitialRow = () => {
    createTableRow(accumulator.binary, multiplier.binary, previousMultiplier.binary, multiplicand.binary, "Initial Values");
};

const createTableRow = (accumulatorValue, multiplierValue, previousMultiplierValue, multiplicandValue, description) => {
    let row = table.insertRow();
    let accumulatorCell = row.insertCell();
    let multiplierCell = row.insertCell();
    let previousMultiplierCell = row.insertCell();
    let multiplicandCell = row.insertCell();
    let descCell = row.insertCell();

    accumulatorCell.textContent = accumulatorValue;
    multiplierCell.textContent = multiplierValue;
    previousMultiplierCell.textContent = previousMultiplierValue;
    multiplicandCell.textContent = multiplicandValue;
    descCell.textContent = description;

    addBinaryClass(accumulatorCell, multiplierCell, previousMultiplierCell, multiplicandCell);
};

const addBinaryClass = (...cells) => {
    cells.forEach(cell => cell.classList.add("font-monospace"));
};

const shiftRight = () => {
    previousMultiplier.binary = multiplier.binary[multiplier.binary.length - 1];
    multiplier.binary = accumulator.binary[accumulator.binary.length - 1] + multiplier.binary.slice(0, -1);
    accumulator.binary = accumulator.binary[0] + accumulator.binary.slice(0, -1);
    createTableRow(accumulator.binary, multiplier.binary, previousMultiplier.binary, multiplicand.binary, "Shift Right");
};

const clearTable = () => {
    nostepEl.textContent = "";
    while (table.rows.length > 0) {
        table.deleteRow(0);
    }
};


const calculateBitsNeeded = (multiplicand, multiplier) => {
    if (multiplicand === 0 && multiplier === 0) {
        return 1;
    }
    const maxValue = Math.max(Math.abs(multiplicand), Math.abs(multiplier));
    const log = Math.log2(maxValue);
    if (Math.floor(log) === log) {
        return Math.floor(log) + 1;
    }
    return Math.floor(log) + 2;
};

const twosComplement = (binary) => {
    let firstOne = binary.lastIndexOf("1");
    let flipped = binary.substring(0, firstOne).replace(/0/g, "2").replace(/1/g, "0").replace(/2/g, "1");
    return flipped + binary.substring(firstOne);
};

const binaryToDecimal = (binary) => {
    if (binary[0] === "1") {
        binary = twosComplement(binary);
        return parseInt(binary, 2) * -1;
    }
    return parseInt(binary, 2);
};