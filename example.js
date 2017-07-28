const compile = require('./6502asmc');

compile(`
  * = $c000
  LDX #10
  loop: TXA
  STA $0400, X
  DEX
  BNE loop
  RTS
`, true);

console.log("");

compile(`
  * = $c000
  LDX #10
  loop: TXA
  STA $0400, X
  DEX
  BEQ end
  JMP loop
  end: RTS
`, true);
