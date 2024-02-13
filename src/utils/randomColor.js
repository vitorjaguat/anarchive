export default function randomColor() {
  let randomNumber = Math.floor(Math.random() * 1000000);
  let stringNumber = String(randomNumber).padStart(6, '0');
  return stringNumber;
}
