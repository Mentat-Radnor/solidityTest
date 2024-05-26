const { expect } = require('chai');
const { ethers } = require('hardhat');

describe("Payments", () => {
  let acc1;
  let acc2;
  let payments;
  let contractAddress;
  // Разворачивание самрт конракта для тестирования
  beforeEach(async () => {
    [acc1, acc2] = await ethers.getSigners();
    const Payments = await ethers.getContractFactory("Payments", acc1);
    payments = await Payments.deploy();
    await payments.waitForDeployment();
    contractAddress = await payments.getAddress();
  })

  it("should be deployed", async () => {
    // Проверка на корректность адреса;
    expect(contractAddress).to.be.properAddress;
  })

  it("should have zero ether be default", async () => {
    const balance = await payments.currentBalance();

    expect(balance).to.eq(0);
  });

  it("should be possible to pay", async () => {
    const sum = 100;
    const message = 'hello test';
    const tx = await payments.connect(acc2).pay(message, { value: sum });
    // Указываем, что списываем деньги со 2 аккаунта и приходят на смарт контракт
    await expect(() => tx).to.changeEtherBalances([acc2, payments], [-sum, sum]);
    await tx.wait();

    const newPayment = await payments.getPayment(acc2.address, 0);

    expect(newPayment.message).to.eq(message);
    expect(newPayment.amount).to.eq(sum);
    expect(newPayment.from).to.eq(acc2.address);
    // const balance = await payments.currentBalance();

    // expect(balance).not.eq(0);

    // отправка 2х платежей, написать о владельце контракта
  });
})