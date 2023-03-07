import { useState, useEffect } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"
import { useNotification } from "web3uikit"
import tokenControlAbi from "../constants/tokenControlAbi.json"
import Indexer from "../components/indexer"
import { Alert } from "@mui/material"
export default function Home() {
    const dispatch = useNotification()
    const { isWeb3Enabled, chainId, account } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "1337"

    const DexAddress = networkMapping[chainString]["DexV1"][0]
    const DEXTokenAddress = networkMapping[chainString]["DEXToken"][0]
    const LPTokenAddress = networkMapping[chainString]["LPToken"][0]
    const tokenControlAddress = networkMapping[chainString]["TokenControl"][0]
    const tokenAddressString = DEXTokenAddress.toString()
    const multiSigAddressString = tokenControlAddress.toString()
    const url = "https://goerli.etherscan.io/address/" + tokenAddressString + ""
    const url2 = "https://goerli.etherscan.io/address/" + multiSigAddressString + ""
    //stateVariables
    const [owners, setOwners] = useState(0)
    const [txCount, setTxCount] = useState(0)
    const [lastTxIndex, setLastTxIndex] = useState(0)
    const [inputIndex, setInputIndex] = useState(0)
    const [txInfo, setTxInfo] = useState({ txIndex: 0, numConfirmations: 0, executed: false })
    const [showTxIndexError, setShowTxIndexError] = useState(false)
    const [isOwner, setIsOwner] = useState(false)
    const [showStepByStep, setShowStepByStep] = useState(false)
    const [startingIndexForBlock, setStartingIndexForBlock] = useState(0)
    //calculations

    //useEffect
    async function updateUI() {
        //Check if user is owner
        let _owners = await getOwners()
        let x = false
        for (let i = 0; i < _owners.length; i++) {
            if (Number(account) == Number(_owners[i])) {
                x = true
            }
        }
        if (x) {
            setIsOwner(true)
        } else {
            setIsOwner(false)
        }
        setOwners(_owners)
        //Tx count for array
        let _txCount = await getTransactionCount()

        setTxCount(_txCount)
        let _lastTxIndex = await getLastTxIndex()
        setLastTxIndex(Number(_lastTxIndex))
        if (_txCount > 8) {
            setStartingIndexForBlock(Number(_lastTxIndex) - 9)
        } else {
            setStartingIndexForBlock(Number(_lastTxIndex) - txCount + 1)
        }
        //get transaction info
        if (lastTxIndex >= inputIndex) {
            setShowTxIndexError(false)
            let transactionInfo = await getTransaction()

            setTxInfo({
                txIndex: inputIndex,
                numConfirmations: Number(transactionInfo[4]),
                executed: transactionInfo[3],
                to: transactionInfo[5],
            })
        } else {
            setShowTxIndexError(true)
        }
    }
    function handleTxChange(e) {
        if (/^\d+\.*(\d+)*$/.test(e.target.value)) {
            setInputIndex(e.target.value)
        } else if (e.target.value == "") {
            setInputIndex(0)
        }
    }
    useEffect(() => {}, [])

    useEffect(() => {
        if (isWeb3Enabled && chainString == 5) {
            updateUI()
        }
    }, [isWeb3Enabled, inputIndex, lastTxIndex, isOwner, showStepByStep, txCount])

    ///////////////////////////////////////////////////////////

    /////////////////////////////////////////////////
    //Handle clicks
    const handleShowStepClick = () => {
        setShowStepByStep(true)
    }
    const handleHideStepClick = () => {
        setShowStepByStep(false)
    }

    const handleMintErc20Click = () => {
        mint1DEX()
    }
    const mint1DEX = () => {
        erc20Mint({
            onError: (error) => {
                console.log(error)
            },
            onSuccess: (tx) => handleMint1DEXSuccess(tx),
        })
    }
    const handleMint1DEXSuccess = () => {
        dispatch({
            type: "success",
            message: "Transaction sent - wait for transaction confirmation and refresh the page",
            title: "Transaction submitted to multisig",
            position: "topR",
        })
    }
    //////////////////////////////////////////
    const handleConfirmClick = () => {
        confirmTx()
    }
    const confirmTx = () => {
        confirmTransaction({
            onError: (error) => {
                console.log(error)
            },
            onSuccess: (tx) => handleConfirmSuccess(tx),
        })
    }
    const handleConfirmSuccess = () => {
        dispatch({
            type: "success",
            message: "Transaction sent - wait for transaction confirmation and refresh the page",
            title: "Transaction confirmed",
            position: "topR",
        })
    }

    ///////////////////
    const handleExecuteClick = () => {
        executeTx()
    }
    const executeTx = () => {
        executeTransaction({
            onError: (error) => {
                console.log(error)
            },
            onSuccess: (tx) => handleExecuteSuccess(tx),
        })
    }
    const handleExecuteSuccess = () => {
        dispatch({
            type: "success",
            message: "Transaction sent - wait for transaction confirmation and refresh the page",
            title: "Transaction executed",
            position: "topR",
        })
    }
    ///////////////////
    const handleRevokeClick = () => {
        revokeTx()
    }
    const revokeTx = () => {
        revokeTransaction({
            onError: (error) => {
                console.log(error)
            },
            onSuccess: (tx) => handleRevokeSuccess(tx),
        })
    }
    const handleRevokeSuccess = () => {
        dispatch({
            type: "success",
            message: "Transaction sent - wait for transaction confirmation and refresh the page",
            title: "Confirmation Revoked",
            position: "topR",
        })
    }
    ///////////////////
    const handleAddOwnerClick = () => {
        addOwners()
    }
    const addOwners = () => {
        addOwner({
            onError: (error) => {
                console.log(error)
            },
            onSuccess: (tx) => handleAddOwnerSuccess(tx),
        })
    }
    const handleAddOwnerSuccess = () => {
        dispatch({
            type: "success",
            message: "Transaction sent - wait for transaction confirmation and refresh the page",
            title: "Transaction sent",
            position: "topR",
        })
    }
    //contract functions
    const { runContractFunction: getTransaction } = useWeb3Contract({
        abi: tokenControlAbi,
        contractAddress: tokenControlAddress,
        functionName: "getTransaction",
        params: {
            _txIndex: inputIndex <= lastTxIndex ? inputIndex : lastTxIndex,
        },
    })

    const { runContractFunction: getLastTxIndex } = useWeb3Contract({
        abi: tokenControlAbi,
        contractAddress: tokenControlAddress,
        functionName: "getLastTxIndex",
        params: {},
    })
    const { runContractFunction: getOwners } = useWeb3Contract({
        abi: tokenControlAbi,
        contractAddress: tokenControlAddress,
        functionName: "getOwners",
        params: {},
    })

    const { runContractFunction: getTransactionCount } = useWeb3Contract({
        abi: tokenControlAbi,
        contractAddress: tokenControlAddress,
        functionName: "getTransactionCount",
        params: {},
    })
    const { runContractFunction: addOwner } = useWeb3Contract({
        abi: tokenControlAbi,
        contractAddress: tokenControlAddress,
        functionName: "addOwner",
        params: {
            newOwner: account ? account : "0x8B5b52af3b1326236f9C09954f0a3A106d0aB92D",
        },
    })
    const { runContractFunction: confirmTransaction } = useWeb3Contract({
        abi: tokenControlAbi,
        contractAddress: tokenControlAddress,
        functionName: "confirmTransaction",
        params: {
            _txIndex: inputIndex,
        },
    })
    const { runContractFunction: executeTransaction } = useWeb3Contract({
        abi: tokenControlAbi,
        contractAddress: tokenControlAddress,
        functionName: "executeTransaction",
        params: {
            _txIndex: inputIndex,
        },
    })
    const { runContractFunction: revokeTransaction } = useWeb3Contract({
        abi: tokenControlAbi,
        contractAddress: tokenControlAddress,
        functionName: "revokeConfirmation",
        params: {
            _txIndex: inputIndex,
        },
    })
    const { runContractFunction: erc20Mint } = useWeb3Contract({
        abi: tokenControlAbi,
        contractAddress: tokenControlAddress,
        functionName: "mint01",
        params: {
            erc20ContractAddress: DEXTokenAddress,
        },
    })
    return (
        <div className=" min-h-screen mt-5">
            {" "}
            {isWeb3Enabled ? (
                chainString == 5 ? (
                    <div className="flex min-h-screen justify-between ">
                        <div>
                            <div className="w-full max-w-xl min-h-4xl min-w-xl  m-5">
                                <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 ">
                                    <div>
                                        {" "}
                                        <h1 class="mb-4 text-xl font-extrabold text-gray-900 dark:text-black md:text-xl lg:text-3xl">
                                            DEX Token
                                            <span class="text-transparent bg-clip-text bg-gradient-to-r to-fuchsia-600 from-indigo-400">
                                                {" "}
                                                Multi-Sig
                                            </span>{" "}
                                        </h1>
                                        <p class="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
                                            DEX token issuance is controlled by this Multi-Sig
                                            contract, which is controlled by a list of owners.
                                        </p>
                                        <p className="my-2">
                                            In this contract anyone can become an owner and use the
                                            access-controlled functions that mint DEX tokens. Click
                                            on the "become owner" button to add your address to the
                                            Owners list.
                                        </p>
                                        <p className="my-2">
                                            Once you are a owner you will be able to queue new
                                            transactions for other owners to vote if they should be
                                            executed by the Multi-Sig. Owners can confirm
                                            transactions and revoke their confirmation, and lastly
                                            execute those transactions if they have enough
                                            confirmations.
                                        </p>
                                        <p className="my-2">
                                            To execute a transaction it will need 2 confirmations
                                            from the owners. You can check the number of
                                            confirmations that the transaction searching them by
                                            transaction index, and confirm the transaction yourself.
                                        </p>{" "}
                                        <p className="my-2">
                                            There is no limit on how many owners this Multi-Sig can
                                            have, try adding two accounts in your posession to the
                                            owners list, queueing a mint transaction, confirming the
                                            transaction with both accounts and executing it.
                                        </p>
                                        <p></p>
                                        {showStepByStep ? (
                                            <button
                                                onClick={handleHideStepClick}
                                                class="bg-violet-400 my-4 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                type="button"
                                            >
                                                Hide step by step
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleShowStepClick}
                                                class="bg-violet-400 my-4 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                type="button"
                                            >
                                                Show step by step instructions
                                            </button>
                                        )}
                                        <p className="my-2 text-violet-500 hover:text-violet-800">
                                            <a href={url} target="_blank">
                                                DEX token address (ERC20): {DEXTokenAddress}
                                            </a>
                                        </p>
                                        <p
                                            target="_blank"
                                            className="my-2 text-violet-500 hover:text-violet-800"
                                        >
                                            <a href={url2}>
                                                Token Control Multi-Sig address:{" "}
                                                {tokenControlAddress}
                                            </a>
                                        </p>
                                    </div>
                                </form>
                                <p className="text-center text-gray-500 text-xs"></p>
                            </div>{" "}
                            {showStepByStep ? (
                                <div className="w-full max-w-xl  min-h-4xl m-5">
                                    <form className="bg-white shadow-md  rounded px-8 pt-6 pb-8 mb-4">
                                        <div>
                                            {" "}
                                            <label
                                                className="block text-gray-700 text-sm font-bold mb-2"
                                                for="username"
                                            >
                                                Step by Step
                                            </label>
                                            <p>
                                                0. Click on the "add my account to owners" button.
                                                It will make a call to add your address to the array
                                                of owners that can interact with the contract. Wait
                                                for the transaction to be included in a block.
                                            </p>
                                            <p>
                                                1. Click mint 1 DEX. This will queue a transaction,
                                                it will then be possible to confirm the transaction.
                                            </p>
                                            <p>
                                                2. Click "Confirm the transaction" inputing the
                                                transaction index you just created.
                                            </p>
                                            <p>
                                                3. The transaction will need two confirmations to be
                                                executable. For testing purposes repeat step 1 and
                                                step 3, inputing the same tx index.
                                            </p>{" "}
                                            <p>
                                                4. Once the transaction has two confirmations, it
                                                can be executed, minting 0,1 DEX token to the
                                                account that called the mint function.
                                            </p>
                                            <p></p>
                                        </div>
                                    </form>
                                    <p className="text-center text-gray-500 text-xs"></p>
                                </div>
                            ) : (
                                <></>
                            )}
                        </div>
                        <div className="w-fit h-120 flex-wrap my-3 ml-40 justify-center">
                            {" "}
                            <div className="w-full justify-center">
                                <Indexer
                                    startingIndexForBlock={startingIndexForBlock}
                                    txCount={txCount}
                                    lastTxIndex={lastTxIndex}
                                    inputIndex={inputIndex}
                                    setInputIndex={setInputIndex}
                                />
                            </div>
                            <div className="w-3/4 h-2/5">
                                <form className="bg-white shadow-md rounded  px-8 pt-6  mb-4  min-h-full min-w-fit">
                                    <div className="flex-col">
                                        {showTxIndexError ? (
                                            <Alert severity="warning">
                                                <strong>
                                                    Transaction {inputIndex} doesn't exist.{" "}
                                                </strong>
                                                There are only transactions uptil index{" "}
                                                {lastTxIndex}
                                            </Alert>
                                        ) : (
                                            <></>
                                        )}

                                        <div className=" flex-col">
                                            <div className="justify-center">
                                                <h1 class="mb-4 text-2xl font-extrabold leading-none tracking-tight text-gray-900 md:text-3xl lg:text-4xl">
                                                    <mark class="px-2 text-white bg-violet-600 rounded dark:bg-violet-600">
                                                        TX {txInfo.txIndex}
                                                    </mark>{" "}
                                                    info
                                                </h1>
                                            </div>
                                            <div className="justify-center">
                                                <button
                                                    type="button"
                                                    class="text-white focus:outline-none focus:ring-4 focus:ring-purple-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2 dark:bg-fuchsia-400 dark:focus:ring-purple-600"
                                                >
                                                    Dex tokens minted to address: {txInfo.to}
                                                </button>
                                            </div>
                                            <div>
                                                <button
                                                    type="button"
                                                    class="text-white bg-violet-500 focus:outline-none focus:ring-4 focus:ring-purple-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2 dark:bg-fuchsia-400 dark:focus:ring-purple-900"
                                                >
                                                    Confirmations: {txInfo.numConfirmations}
                                                </button>
                                            </div>
                                            <div className="justify-center">
                                                <button
                                                    type="button"
                                                    class="text-white bg-violet-500 focus:outline-none focus:ring-4 focus:ring-purple-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2 dark:bg-fuchsia-400 dark:focus:ring-purple-900"
                                                >
                                                    {txInfo.executed ? (
                                                        <div>
                                                            Transaction {txInfo.txIndex} has been
                                                            executed
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div>
                                                                Transaction {txInfo.txIndex} has not
                                                                been executed
                                                            </div>
                                                        </div>
                                                    )}{" "}
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-center text-gray-900 text-XL m-2 ">
                                            {isOwner ? (
                                                txInfo.executed ? (
                                                    <div className="my-4 flex">
                                                        <button
                                                            onClick={() =>
                                                                console.log("Transaction executed")
                                                            }
                                                            class="bg-rose-400 mx-2 hover:bg-rose-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                            type="button"
                                                        >
                                                            Confirm transaction
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                console.log("Transaction executed")
                                                            }
                                                            class="bg-rose-400 mx-2 hover:bg-rose-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                            type="button"
                                                        >
                                                            Revoke confirmation
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                console.log("Transaction executed")
                                                            }
                                                            class="bg-rose-400 mx-2 hover:bg-rose-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                            type="button"
                                                        >
                                                            Execute transaction
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="my-4 flex">
                                                            <button
                                                                onClick={handleConfirmClick}
                                                                class="bg-pink-400 mx-2 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                                type="button"
                                                            >
                                                                Confirm transaction
                                                            </button>
                                                            <button
                                                                onClick={handleRevokeClick}
                                                                class="bg-red-600 mx-2 hover:bg-red-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                                type="button"
                                                            >
                                                                Revoke confirmation
                                                            </button>
                                                            <button
                                                                onClick={handleExecuteClick}
                                                                class="bg-indigo-400 mx-2 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                                type="button"
                                                            >
                                                                Execute transaction
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            ) : (
                                                <div>
                                                    <button
                                                        onClick={handleAddOwnerClick}
                                                        class="bg-violet-400 hover:bg-violet-600 my-2 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                        type="button"
                                                    >
                                                        To confirm transactions and execute them you
                                                        need to be a Owner
                                                    </button>
                                                </div>
                                            )}
                                        </p>
                                    </div>
                                </form>
                                <p className="text-center text-gray-500 text-xs"></p>
                            </div>
                            <div className="container my-12 w-full max-w-xl min-h-4xl hover:bg-slate-300">
                                <form className="bg-white shadow-md rounded h-full px-8 pt-6 pb-8 mb-4">
                                    <div>
                                        <div className="my-2">
                                            {isOwner ? (
                                                <button
                                                    onClick={() => console.log("already an owner")}
                                                    class="bg-violet-400 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                    type="button"
                                                >
                                                    You are already a Owner!
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleAddOwnerClick}
                                                    class="bg-violet-400 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                    type="button"
                                                >
                                                    Become a Multi-Sig owner
                                                </button>
                                            )}
                                        </div>
                                        <div className="my-2">
                                            {isOwner ? (
                                                <button
                                                    onClick={handleMintErc20Click}
                                                    class="bg-violet-400 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                    type="button"
                                                >
                                                    Mint 0.1 DEX to your account
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => console.log("not an owner")}
                                                    class="bg-red-400 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                    type="button"
                                                >
                                                    Mint 0.1 DEX to your account
                                                </button>
                                            )}

                                            <p>
                                                {" "}
                                                This will create transaction with index{" "}
                                                {lastTxIndex + 1}{" "}
                                            </p>
                                        </div>
                                        <div className="my-2">
                                            <p className="text-left text-bold text-gray-500 text-m">
                                                Check a transaction
                                            </p>
                                            <input
                                                onChange={handleTxChange}
                                                value={inputIndex}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                id="username"
                                                type="number"
                                                placeholder="Transaction index"
                                            />
                                        </div>
                                    </div>
                                </form>
                                <p className="text-center text-gray-500 text-xs"></p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-10 px-4 font-bold text-3xl  min-h-full  text-white">
                        {" "}
                        "Please connect to the Göerli testnet"
                    </div>
                )
            ) : (
                <div class="py-10 px-4 font-bold text-3xl  min-h-full  text-white">
                    {" "}
                    Web3 currently not enabled, please connect your wallet
                </div>
            )}
        </div>
    )
}
