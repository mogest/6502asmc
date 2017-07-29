'use strict';

const MODE_OFFSETS = {
  "implied": 0,
  "immediate": 1,
  "zero": 2,
  "zero,x": 3,
  "absolute": 4,
  "absolute,x": 5,
  "absolute,y": 6,
  "indirect,x": 7,
  "indirect,y": 8,
  "accumulator": 9,
  "indirect": 10,
  "zero,y": 11
};

const MODE_BYTES = {
  "implied": 1,
  "accumulator": 1,
  "immediate": 2,
  "zero": 2,
  "zero,x": 2,
  "zero,y": 2,
  "absolute": 3,
  "absolute,x": 3,
  "absolute,y": 3,
  "indirect": 3,
  "indirect,x": 3,
  "indirect,y": 3,
};

const BRANCH_OPS = ["BPL", "BMI", "BVC", "BVS", "BCC", "BCS", "BNE", "BEQ"];

const OPS = {
  //      impl  imm   zero  zerox abs   absx  absy  indx  indy  acc   ind   zeroy
  "ADC": [null, 0x69, 0x65, 0x75, 0x6d, 0x7d, 0x79, 0x61, 0x71],
  "AND": [null, 0x29, 0x25, 0x35, 0x2d, 0x3d, 0x39, 0x21, 0x31],
  "ASL": [null, null, 0x06, 0x16, 0x0e, 0x1e, null, null, null, 0x0a],
  "BIT": [null, null, 0x24, null, 0x2c],
  "BPL": [null, null, null, null, 0x10],
  "BMI": [null, null, null, null, 0x30],
  "BVC": [null, null, null, null, 0x50],
  "BVS": [null, null, null, null, 0x70],
  "BCC": [null, null, null, null, 0x90],
  "BCS": [null, null, null, null, 0xb0],
  "BNE": [null, null, null, null, 0xd0],
  "BEQ": [null, null, null, null, 0xf0],
  "BRK": [0x00],
  "CMP": [null, 0xc9, 0xc5, 0xd5, 0xcd, 0xdd, 0xd9, 0xc1, 0xd1],
  "CPX": [null, 0xe0, 0xe4, null, 0xec],
  "CPY": [null, 0xc0, 0xc4, null, 0xcc],
  "DEC": [null, null, 0xc6, 0xd6, 0xce, 0xde],
  "EOR": [null, 0x49, 0x45, 0x55, 0x4d, 0x5d, 0x59, 0x41, 0x51],
  "CLC": [0x18],
  "SEC": [0x38],
  "CLI": [0x58],
  "SEI": [0x78],
  "CLV": [0xb8],
  "CLD": [0xd8],
  "SED": [0xf8],
  "INC": [null, null, 0xe6, 0xf6, 0xee, 0xfe],
  "JMP": [null, null, null, null, 0x4c, null, null, null, null, 0x6c],
  "JSR": [null, null, null, null, 0x20],
  "LDA": [null, 0xa9, 0xa5, 0xb5, 0xad, 0xbd, 0xb9, 0xa1, 0xb1],
  "LDX": [null, 0xa2, 0xa6, null, 0xae, null, 0xbe, null, null, null, null, 0xb6],
  "LDY": [null, 0xa0, 0xa4, 0xb4, 0xac, 0xbc],
  "LSR": [null, null, 0x46, 0x56, 0x4e, 0x5e, null, null, null, 0x4a],
  "NOP": [0xea],
  "ORA": [null, 0x09, 0x05, 0x15, 0x0d, 0x1d, 0x19, 0x01, 0x11],
  "TAX": [0xaa],
  "TXA": [0x8a],
  "DEX": [0xca],
  "INX": [0xe8],
  "TAY": [0xa8],
  "TYA": [0x98],
  "DEY": [0x88],
  "INY": [0xc8],
  "ROL": [null, null, 0x26, 0x36, 0x2e, 0x3e, null, null, null, 0x2a],
  "ROR": [null, null, 0x66, 0x76, 0x6e, 0x7e, null, null, null, 0x6a],
  "RTI": [0x40],
  "RTS": [0x60],
  "SBC": [null, 0xe9, 0xe5, 0xf5, 0xed, 0xfd, 0xf9, 0xe1, 0xf1],
  "STA": [null, null, 0x85, 0x95, 0x8d, 0x9d, 0x99, 0x81, 0x91],
  "TXS": [0x9a],
  "TSX": [0xba],
  "PHA": [0x48],
  "PLA": [0x68],
  "PHP": [0x08],
  "PLP": [0x28],
  "STX": [null, null, 0x86, null, 0x8e, null, null, null, null, null, null, 0x96],
  "STY": [null, null, 0x84, 0x94, 0x8c]
};

function hex(number, padding) {
  let string = number.toString(16);
  while (string.length < padding) { string = "0" + string; }
  return string.toUpperCase();
}

function rightPad(string, count) {
  string = string === undefined ? "" : string.toString();
  while (string.length < count) { string += " "; }
  return string;
}

function formatValue(op, mode, value) {
  switch (mode) {
    case "implied":      return "";
    case "accumulator":  return "A";
    case "immediate":    return "#$" + hex(value, 2);
    case "zero":         return "$" + hex(value, 2);
    case "zero,x":       return "$" + hex(value, 2) + ", X";
    case "zero,y":       return "$" + hex(value, 2) + ", Y";
    case "absolute":     return "$" + hex(value, 4);
    case "absolute,x":   return "$" + hex(value, 4) + ", X";
    case "absolute,y":   return "$" + hex(value, 4) + ", Y";
    case "indirect":     return "($" + hex(value, 4) + ")";
    case "indirect,x":   return "($" + hex(value, 4) + ", X)";
    case "indirect,y":   return "($" + hex(value, 4) + "), Y";
  }
}

function parseNumber(value, bytes) {
  let match;
  let number;

  if (match = value.match(/^\$([0-9a-f]+)$/i)) {
    number = parseInt(match[1], 16);
  }
  else if (value.match(/^[0-9]+$/)) {
    number = parseInt(value, 10);
  }
  else if (value.match(/^[a-z_]\w*$/i)) {
    return ["label", value];
  }
  else {
    throw new Error(`unable to parse "${value}" as a number or label`);
  }

  if (number < 0) {
    throw new Error(`number ${number} cannot be negative`);
  }

  if (number >= Math.pow(2, bytes*8)) {
    throw new Error(`number ${number} must be smaller than ${Math.pow(2, bytes*8)}`);
  }

  return ["number", number];
}

function parse(op, mode, argument, pc) {
  const opValues = OPS[op.toUpperCase()];
  if (opValues === undefined) {
    throw new Error(`unknown op ${op}`);
  }

  const modeOffset = MODE_OFFSETS[mode];

  if (modeOffset === undefined) {
    throw new Error(`unknown mode ${mode}`);
  }

  const value = opValues[modeOffset];
  if (value === undefined || value === null) {
    throw new Error(`mode ${mode} is not valid for op ${op}`);
  }

  if (BRANCH_OPS.includes(op)) {
    const diff = argument - (pc + 2);

    if (diff < -128 || diff > 127) {
      throw new Error("can only branch within 127 bytes of current location");
    }

    return [value, diff < 0 ? 256 + diff : diff];
  }

  switch (mode) {
    case "implied":
    case "accumulator":
      return [value];
    case "immediate":
    case "zero":
    case "zero,x":
    case "zero,y":
      return [value, argument];
    case "absolute":
    case "absolute,x":
    case "absolute,y":
    case "indirect":
    case "indirect,x":
    case "indirect,y":
      return [value, argument & 0xff, argument >> 8];
  }
}

function parseLine(rawLine, pc, labels) {
  let line = rawLine.replace(/;.*$/, '').replace(/^\s+|\s+$/g, '');

  if (!line) { return [pc]; }

  const pcSetMatch = line.match(/^\*\s*=\s*(\$?[0-9a-f]+)$/i);
  if (pcSetMatch) {
    pc = parseNumber(pcSetMatch[1], 2, {});
    return [pc];
  }

  const labelMatch = line.match(/^([a-z_]\w*)\s*\:\s*(.+)/i);

  if (labelMatch) {
    const name = labelMatch[1];
    if (name.toUpperCase() === 'A') {
      throw new Error(`"${name}" is not a valid label because some opcodes take "A" as a parameter, e.g. ROR A`);
    }
    if (labels[name]) {
      throw new Error(`label ${name} was defined more than once`);
    }
    labels[name] = pc;
    line = labelMatch[2];
  }

  let match, mode;

  if (match = line.match(/^([a-z]{3})$/i)) {
    mode = 'implied';
  }
  else if (match = line.match(/^([a-z]{3})\s+a$/i)) {
    mode = 'accumulator';
  }
  else if (match = line.match(/^([a-z]{3})\s+#([0-9]+|\$[0-9a-f]+)$/i)) {
    mode = 'immediate';
  }
  else if (match = line.match(/^([a-z]{3})\s+([0-9]+|\$[0-9a-f]+|\w+)$/i)) {
    mode = 'absolute';
  }
  else if (match = line.match(/^([a-z]{3})\s+([0-9]+|\$[0-9a-f]+|\w+),\s*([xy])$/i)) {
    mode = 'absolute,' + match[3].toLowerCase();
  }
  else if (match = line.match(/^([a-z]{3})\s+\(([0-9]+|\$[0-9a-f]+|\w+)\)$/i)) {
    mode = 'indirect';
  }
  else if (match = line.match(/^([a-z]{3})\s+\(([0-9]+|\$[0-9a-f]+|\w+),\s*x\)$/i)) {
    mode = 'indirect,x';
  }
  else if (match = line.match(/^([a-z]{3})\s+\(([0-9]+|\$[0-9a-f]+|\w+)\),\s*y$/i)) {
    mode = 'indirect,y';
  }

  if (mode) {
    const op = match[1], argument = match[2];

    if (argument !== undefined) {
      const [argType, argValue] = parseNumber(argument, mode === 'immediate' ? 1 : 2);

      if (mode.includes("absolute") && argType === 'number' && argValue < 256) {
        mode = mode.replace("absolute", "zero");
      }

      return [pc, op, mode, argType, argValue];
    }
    else {
      return [pc, op, mode];
    }
  }
  else {
    throw new Error(`could not parse line "${line}"`);
  }
}

function runFirstPass(program) {
  const lines = program.split("\n");

  let pc = 0xc000;
  let labels = {};
  let instructions = [];

  for (const line of lines) {
    const result = parseLine(line, pc, labels);
    instructions.push(result);

    pc += BRANCH_OPS.includes(result[1]) ? 2 : (MODE_BYTES[result[2]] || 0);
  }

  return {instructions, labels};
}

function resolveValue(argType, argValue, labels) {
  if (argType) {
    if (argType === 'label') {
      const value = labels[argValue];
      if (value === undefined) {
        throw new Error(`there is a reference to label "${argValue}" but this label is not defined anywhere`);
      }
      return value;
    }
    else {
      return argValue;
    }
  }
}

function runSecondPass({instructions, labels}, debug) {
  let output = [];

  for (const instruction of instructions) {
    const [pc, op, mode, argType, argValue] = instruction;

    if (op) {
      const value = resolveValue(argType, argValue, labels);
      const result = parse(op, mode, value, pc);

      if (debug) {
        let argString = formatValue(op, mode, value);
        console.log("$" + hex(pc) + "  " + op.toUpperCase() + " " + rightPad(argString, 10) + "   =>", result);
      }

      output = output.concat(result);
    }
  }

  return output;
}

function compile(program, debug) {
  const data = runFirstPass(program);
  return runSecondPass(data, debug);
}

module.exports = compile;
