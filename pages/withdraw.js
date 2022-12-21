import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import { Form, Card } from "web3uikit"
import { ethers } from "ethers"
import { useMoralis, useWeb3Contract } from "react-moralis"
import NFTABI from "../constants/BasicNft.json"
import NFTMarketABI from "../constants/NFTMarket.json"
import networkMapping from "../constants/networkMapping.json"
import { useNotification } from "web3uikit"
import { useState, useEffect } from "react"
export default function Home() {
    const [itemForSale, setItemForSale] = useState(false)
    const [proceedsState, setProceeds] = useState(0)
    const [sellNftState, setSellNftState] = useState({ nftAddress: 0, tokenId: 0, price: 0 })
    const [imageURI, setImageURI] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [tokenDescription, setTokenDescription] = useState("")
    ///////////////////////////////////////////////
    //USENOTIFICATION
    ///////////////////////////////////////////////
    const dispatch = useNotification()
    ///////////////////////////////////////////////
    //MARKETPLACE ADDRESS SOURCING
    //chain Id from Moralis comes in HEX
    //////////////////////////////////////////
    const { chainId, isWeb3Enabled, account } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "1337"
    const marketplaceAddress = networkMapping[chainString]["NFTMarket"][0]

    const { runContractFunction } = useWeb3Contract()

    //////
    const { runContractFunction: getProceeds } = useWeb3Contract({
        abi: NFTMarketABI,
        contractAddress: marketplaceAddress,
        functionName: "getProceeds",
        params: {
            seller: account,
        },
    })
    async function updateUI() {
        const proceeds = await getProceeds()
        console.log(proceeds.toString())
        //ipfs gateway: everyone should be able to see the nfts

        setProceeds(proceeds.toString())
    }
    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
            console.log(`rerendered from Sell page use effect, isWeb3Enabledd ${isWeb3Enabled}`)
        }
    }, [isWeb3Enabled])

    /////////////////////////////////
    //withdraw proceeds function
    ////////////////////////////////
    const handleWithdrawProceedsSuccess = () => {
        dispatch({
            type: "success",
            message: "The proceeds from the sale of your NFT's have been sent to your accountS",
            title: "Proceeds Withdrawn!",
            position: "topR",
        })
    }
    const { runContractFunction: withdrawProceeds } = useWeb3Contract({
        abi: NFTMarketABI,
        contractAddress: marketplaceAddress,
        functionName: "withdrawProceeds",
        params: {},
    })
    const handleProceedsCardClick = () => {
        console.log("handleProceedsCardClick")

        withdrawProceeds({
            onError: (error) => console.log(error),
            onSuccess: handleWithdrawProceedsSuccess,
        })
    }
    /////////////////////////////////////////////////////////////
    //FORM
    //We use Web3uikit Form that already handles the work of tracking state and submitting to a function
    //when we hit the submit button on form, its going to automatically pass the data object to the function that is executed onSubmit.
    /////////////////////////////////////////////////////////////
    //import { Form } from "web3uikit"
    /////////////////////////////////////////////////////////////
    return (
        <div class="flex m-32 content-center h-32 w-80">
            <Card title="Click to withdraw your proceeds" onClick={handleProceedsCardClick}>
                <div className=" text-left ">
                    <div className="m-4">
                        <div className="fond-bold font-mono">
                            {ethers.utils.formatEther(proceedsState)} ETH
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
