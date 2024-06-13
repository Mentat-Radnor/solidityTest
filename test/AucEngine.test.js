const { expect } = require('chai');
const { ethers } = require('hardhat');

const itemDescribe = 'This is great spher';
const duration = 60;

describe("AucEngine", () => {
  let owner, buyer, seller, auct, tx, cAuction;

  beforeEach(async () => {
    [owner, seller, buyer] = await ethers.getSigners()

    const AucEngine = await ethers.getContractFactory("AucEngine", owner);
    auct = await AucEngine.deploy();
    await auct.waitForDeployment(); 

    tx = await auct.connect(seller).createAuction(
      ethers.parseEther('0.0001'),
      3,
      itemDescribe,
      duration
    );
    cAuction = await auct.auctions(0);
  })

  const getTimestamp = async (
    bn
  ) => (await ethers.provider.getBlock(bn)).timestamp;

  const delay = (
    ms
  ) => new Promise(resolve => setTimeout(resolve, ms)); // моэно просто отработать через setTimeout

  const setBuyTransaction = () => auct
    .connect(buyer).buy(
      0,
      { value: ethers.parseEther('0.0001')},
    );

  it('sets owner', async () => {
    const currentOwner = await auct.owner();

    expect(currentOwner).to.eq(owner.address)
  })

  // Проверка на то, что сможет сделать withdraw только owner
  it('do withdraw only owner', async () => {
    await setBuyTransaction();
    const withdrawValue = await ethers.provider.getBalance(auct);

    await expect(
      auct.withdraw()
    ).to.changeEtherBalance(owner, withdrawValue)
  });

  it('correct withdraw revert with message', async () => {
    await expect(
      auct.connect(seller).withdraw()
    ).to.be.revertedWith('You are not owner')
  });

  describe('createAuction', async () => {
    it('is starting price correctly?', () => {
      expect(auct.connect(seller).createAuction(
        0,
        3,
        itemDescribe,
        duration
      )).to.be.revertedWith('incorrect starting price')
    });

    it('create auction correctly', async () => {  
      expect(cAuction.item).to.eq(itemDescribe);

      const ts = await getTimestamp(tx.blockNumber);
      expect(cAuction.endsAt).to.eq(ts + duration);
    })
    it("check buy function", async () => {
      await delay(2000);
      
      const buyTx = await setBuyTransaction();

      cAuction = await auct.auctions(0);
      const finalPrice = Number(cAuction.finalPrice);
      const currentPrice = finalPrice - Math.floor(((finalPrice * 10) / 100));
      await expect(() => buyTx).to.changeEtherBalance(
        seller,
        currentPrice
      );

      // проверка на отправку события
      await expect(buyTx)
        .to.emit(auct, 'AuctionEnded')
        .withArgs(0, finalPrice , buyer.address);

      await expect(setBuyTransaction())
        .to.be.revertedWith('Stopped!');
    })

    it("Is there enough money?", async () => {
      await expect(auct
      .connect(buyer).buy(
        0,
        { value: ethers.parseEther('0.00001')},
      )).to.be.revertedWith('not enough funds!')
    })

    it("Refund of extra money", async () => {
      const buyerBet = ethers.parseEther('0.001');
      const currentPrice = await auct.getPriceFor(0);
      console.log(currentPrice);
      const initialBuyerBalance = await ethers.provider.getBalance(buyer.address);
      const tx = await auct.connect(buyer).buy(0, { value: buyerBet });

      const receipt = await tx.wait();


      const gasUsed = receipt.gasUsed;
      console.log(receipt);

      const finalBuyerBalance = await ethers.provider.getBalance(buyer.address);

      console.log(gasUsed);
      console.log(`initalBalance ${initialBuyerBalance}`);
      console.log(`finalBalance ${finalBuyerBalance}`);
      console.log(initialBuyerBalance - currentPrice - gasUsed - finalBuyerBalance);
      // TODO Почему не получается корректно определить refund?
      // expect(finalBuyerBalance).to.equal(
      //   initialBuyerBalance.sub(buyerBet).add(expectedRefund).sub(gasUsed)
      // );
    })
  })

  describe('check Engine actions', () => {
    it('auction is stopped?', async () => {
      await setBuyTransaction();

      await expect(
        auct.getPriceFor(0)
      ).to.be.revertedWith('Stopped!');
    })
  })
})