// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Demo {
  // public
  // external
  // internal - обращаться из нутри смарт контракта
  // private - из смарт контракта 

  //view - данная функция может только читать данные, а не модифицировать
  //pure - 

  // function getBalance() public view returns(uint) {
  //   return address(this).balance;
  // }

  function getBalance() public view returns(uint balance) {
    balance = address(this).balance;
  }
}

