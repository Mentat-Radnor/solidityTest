// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Demo {
  // public
  // external
  // internal - обращаться из нутри смарт контракта
  // private - из смарт контракта 

  //view - данная функция может только читать данные, а не модифицировать
  //pure - эта функция вызываться через call, но она не может читать сторонние данные

  // function getBalance() public view returns(uint) {
  //   return address(this).balance;
  // }
  string message = 'hello!'; //state
  uint public contractBalance;

  function pay() external payable {
    // contractBalance += msg.value;
  }

  // transaction - за эту функцию нужно будет платить gas
  function setMessage(string memory newMessage) external {
    message = newMessage;
  }

  function getBalance() public view returns(uint balance) {
    balance = address(this).balance;
  }

  function getMessage() external view returns(string memory) {
    return message;
  }

  function rate(uint amount) public pure returns(uint) {
    return amount * 3;
  }

  // fallback отработает если приходят деньги, но название функции не верное. (деньги будут зачисленны на счет, либо можно вернуть ошибку)
  fallback() external payable {}
  // receive function функция, которая будет вызыаться если в смарк контракт придут деньги на счет без указания выполнения функции
  receive() external payable {
    
  }
}

