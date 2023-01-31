import Head from "next/head"
import Image from "next/image"
import checkImage from "../img/shield.png"
import thumbImage from "../img/thumb.png"
import styles from "../styles/Home.module.css"
import { useState, useEffect } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"
import DexABI from "../constants/DexV1abi.json"
import DEXABI from "../constants/DEXabi.json"
import WBTCabi from "../constants/WBTC.json"
import LPTokenabi from "../constants/LPTokenabi.json"
import { Card, useNotification } from "web3uikit"
import { ethers } from "ethers"
import DexV1EthToToken from "../components/dexV1EthToToken"
import DexV1TokenToEth from "../components/dexV1TokenToEth"
import Graph from "../components/graph"
import WETHabi from "../constants/WETHabi.json"
import Reserves from "../components/reserves"
import Explanation from "../components/expl"
import { letterSpacing } from "@mui/system"
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
    const url = "https://goerli.etherscan.io/address/" + tokenAddressString + ""
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
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled, inputIndex, lastTxIndex, isOwner, showStepByStep])

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
        functionName: "Mint1",
        params: {
            erc20ContractAddress: DEXTokenAddress,
        },
    })
    return (
        <div className=" min-h-screen my-5">
            {" "}
            {isWeb3Enabled ? (
                chainString == 5 ? (
                    <div className="flex min-h-screen justify-between ">
                        <div>
                            <div className="w-full max-w-xl min-h-4xl min-w-xl  m-5">
                                <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 ">
                                    <div>
                                        {" "}
                                        <label
                                            className="block text-gray-700 text-xl font-bold mb-2"
                                            for="username"
                                        >
                                            DEX Token Multi-Sig
                                        </label>
                                        <p className="my-2">
                                            This Dapp interacts with a smart contract that controls
                                            the minting of DEX tokens.{" "}
                                        </p>
                                        <p className="my-2">
                                            To be able to interact with this multi-sig you will have
                                            to become an owner. Click on the "become owner" button
                                            to be able to interact with the multi-sig{" "}
                                        </p>
                                        <p className="my-2">
                                            Once you are a owner you will be able to queue
                                            transactions, confirm transactions and revoke your
                                            confirmation, and lastly execute those transactions.
                                        </p>
                                        <p className="my-2">
                                            To execute a transaction the transaction needs 2
                                            confirmations from the owners. You can check the number
                                            of transactions on the transaction info.
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
                                            <a href={url}>DEX token address: {DEXTokenAddress}</a>
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
                                                1. Click add my account to owners. Wait for the
                                                transaction to be included in a block.
                                            </p>
                                            <p>
                                                2. Click mint 1 DEX. This will queue a transaction,
                                                it will then be possible to confirm the transaction.
                                            </p>
                                            <p>
                                                3. Click "Confirm the transaction" inputing the
                                                transaction index you just created.
                                            </p>
                                            <p>
                                                4. The transaction will need two confirmations to be
                                                executable. For testing purposes repeat step 1 and
                                                step 3, inputing the same tx
                                            </p>{" "}
                                            <p>
                                                5. Once the transaction has two confirmations, it
                                                can be executed, minting 1 DEX token to the account
                                                that called the mint function.
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
                        <div className="w-fit flex-wrap m-4">
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
                            <div className="">
                                <form className="bg-white shadow-md rounded  px-8 pt-6 pb-8 mb-4 flex min-h-full ">
                                    <div className="min-h-full  w-30"> </div>
                                    <div className="flex justify-center">
                                        <div className="flex-wrap   w-120 rounded-xl">
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
                                            <div className="h-fit flex items-center justify-center ">
                                                <div>
                                                    <p className="text-center text-gray-900 text-XL m-2">
                                                        Transaction {txInfo.txIndex}
                                                    </p>{" "}
                                                    <p className="text-center text-gray-900 text-XL m-2">
                                                        Dex tokens minted to address: {txInfo.to}
                                                    </p>
                                                    <p className="text-center text-gray-900 text-XL m-2">
                                                        Confirmations on this transaction:{" "}
                                                        {txInfo.numConfirmations}
                                                    </p>
                                                    <p className="text-center text-gray-900 text-XL m-2">
                                                        {txInfo.executed ? (
                                                            <div>
                                                                Transaction {txInfo.txIndex} has
                                                                been executed
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <div>
                                                                    Transaction {txInfo.txIndex} has
                                                                    not been executed
                                                                </div>
                                                            </div>
                                                        )}{" "}
                                                        {isOwner ? (
                                                            txInfo.executed ? (
                                                                <div className="my-4 flex">
                                                                    <button
                                                                        onClick={() =>
                                                                            console.log(
                                                                                "Transaction executed"
                                                                            )
                                                                        }
                                                                        class="bg-rose-400 mx-2 hover:bg-rose-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                                        type="button"
                                                                    >
                                                                        Confirm transaction
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            console.log(
                                                                                "Transaction executed"
                                                                            )
                                                                        }
                                                                        class="bg-rose-400 mx-2 hover:bg-rose-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                                        type="button"
                                                                    >
                                                                        Revoke confirmation
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            console.log(
                                                                                "Transaction executed"
                                                                            )
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
                                                                            onClick={
                                                                                handleConfirmClick
                                                                            }
                                                                            class="bg-pink-400 mx-2 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                                            type="button"
                                                                        >
                                                                            Confirm transaction
                                                                        </button>
                                                                        <button
                                                                            onClick={
                                                                                handleRevokeClick
                                                                            }
                                                                            class="bg-red-600 mx-2 hover:bg-red-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                                            type="button"
                                                                        >
                                                                            Revoke confirmation
                                                                        </button>
                                                                        <button
                                                                            onClick={
                                                                                handleExecuteClick
                                                                            }
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
                                                                    To confirm transactions and
                                                                    execute them you need to be a
                                                                    Owner
                                                                </button>
                                                            </div>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
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
                    <div> not in goerli</div>
                )
            ) : (
                <div class="font-mono text-xl text-white m-16">
                    {" "}
                    Web3 currently not enabled, please connect your wallet
                </div>
            )}
        </div>
    )
}
