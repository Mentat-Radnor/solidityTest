const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Conditions', () => {
  let owner;
  let other_addr;
  let conditions;
  let contractAdress;

  beforeEach(async () => {
    [owner, other_addr] = await ethers.getSigners();
    
    const ConditionsContract = await ethers.getContractFactory('Conditions', owner);
    conditions = await ConditionsContract.deploy();
    conditions = await conditions.waitForDeployment(); 
    contractAdress = await conditions.getAddress();
  })

  const sendMoney = async (sender, amount = 100) => {
    const txData = {
      from: sender.address,
      to: contractAdress,
      value: amount.toString(),
    }

    const tx = await sender.sendTransaction(txData);
    await tx.wait();
    return [tx, amount];
  }

  it('should allow to send money', async () => {
    const userValue = 120;
    const [sendMoneyTx, amount] = await sendMoney(other_addr, userValue);
    
    await expect(() => sendMoneyTx).to.changeEtherBalance(contractAdress, userValue)

    const { timestamp } = await ethers.provider.getBlock(sendMoneyTx.blockNumber)
    // Проверка на запуск события при выполнении функции
    await expect(sendMoneyTx)
      .to.emit(conditions, "Paid")
      .withArgs(other_addr, userValue, timestamp);
  })

  it('should withdraw only owner', async () => {
    const [_, amount] = await sendMoney(other_addr)
    // const contractBalance = await ethers.provider.getBalance(contractAdress);

    const tx = await conditions.withdraw(owner.address);

    // Проверяем, что владелец может успешно вывести средства (более простая проверка)
    await expect(conditions.withdraw(owner.address)).to.not.be.reverted;
    // Проверка с тем, что выведуться именно нужное количество средств
    await expect(() => tx)
      .to.changeEtherBalances(
        [conditions, owner],
        [-amount, amount]);
  })

  it('should not allow withdraw', async () => {
    await sendMoney(other_addr)   
    
    await expect(
      // выполняем транзакцию за другого пользователя
      conditions.connect(other_addr).withdraw(other_addr.address)
    ).to.be.revertedWithPanic(0x01);
  })
})