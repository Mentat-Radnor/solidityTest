// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Conditions {
  // require - проверка на наличие. Пример: require(owner == msg.sender, "Ownable: caller is not the owner") 1. Условие, 2. текст с ошибкой
  // revert - принимает 1 аргумент и это сообщение об ошибке.
  // assert - функция, которую редко используют. Принимает 1 аргумент выражение (owner != msg.sender) породит ошибку Panic Потребляет меньше всего gas
  address public owner;

  // Конструктор это функция, которая вызывается один раз при развертывании конратка
  constructor() {
    owner = msg.sender;
  }

  // Собственные модификаторы
  // Модификатор могут принимать аргумент
  modifier onlyOwner(address _to) {
    assert(owner == msg.sender);
    require(_to != address(0), "incorrect error"); // проверка на наличие адреса
    _;
  }

  // События сообщаем внешнему миру происходящее событие сохраняется не в блокчейне (дешевое хранение информации и вытягивать эти данные в js)
  // Журнал событий можно читать только из вне смарт конракта
  // indexed по индексу можно осуществлять поиск

  event Paid(address indexed _from, uint _amount, uint _timestamp);

  function pay() public payable {
    emit Paid(msg.sender, msg.value, block.timestamp);
  }

  receive() external payable {
    pay();
  }

  // Добавили свой собственный модификатор onlyOwner
  function withdraw (address payable _to) external onlyOwner(_to){
    // require(owner == msg.sender, 'You must be owner');
    // пример с revert;
    // if (owner != msg.sender) {
    //   revert('You must be owner');
    // }

    // assert(owner == msg.sender);
    _to.transfer(address(this).balance);
  }
}
