const compile = require('./6502asmc');

compile(`
  * = $c100
  LDX #10
  loop: TXA
  STA $0400, X
  DEX
  BNE loop
  RTS
`, true);

console.log("");

compile(`
  org $c200
  LDX #10
  loop: TXA
  STA $0400, X
  DEX
  BEQ end
  JMP loop
  end: RTS
`, true);

console.log("");

compile(`
  lda #'!'
  jsr $ffd2
  ldx #0
loop:
  lda text, x
  beq done
  jsr $ffd2
  inx
  jmp loop
done:
  rts

text:
  .byte "HE SAID, \\"HELLO, WORLD\\".", 0
  .word $abcd, 30
`, true);
