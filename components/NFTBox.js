import { useState, useEffect } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import NFTMarketABI from "../constants/NFTMarket.json"
import BasicNftABI from "../constants/BasicNft.json"
import Image from "next/image"
import { Card, useNotification } from "web3uikit"
import { ethers } from "ethers"
import UpdateListingModal from "./updateListingModal"

//////////////////////////////////////////////////////////////////////////////////////////////
// NFT BOX is a component used to render a box with all the NFT info
//To do so it uses the props that it is passed such as price, tokenId, nftAddress, and seller
//some of these attriubutes are displayed directly, while the Name, Image and Description are queried to the NFT contract
//The function updateUI() is called on a useEffect that depends on IsWeb3Enabled, this function will set state in the component
//to later display all the information
//
//The other function is buy item, which can be called if the user, thats not the owner of the NFT clicks on the box. On success, a notification will appear.
//
//In case the owner clicks on the box, a modal will be displayed, which is itself another component.
//The updateListing modal's visibility depends on the showModal state, which is triggered by a owner click, and when closed it changes showModal state to false.
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
//truncate fucntion to morph the address on display
//////////////////////////////////////////////////////////////////////////////////////////////
const truncateStr = (fullStr, strLen) => {
    if (fullStr.length <= strLen) return fullStr
    const separator = "..."
    const separatorLength = separator.length
    const charsToShow = strLen - separatorLength
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 2)
    return (
        fullStr.substring(0, frontChars) + separator + fullStr.substring(fullStr.length - backChars)
    )
}

export default function NFTBox({ price, nftAddress, tokenId, marketplaceAddress, seller }) {
    //////////
    //HOOKS//
    /////////
    const { isWeb3Enabled, account } = useMoralis()
    const [imageURI, setImageURI] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [tokenDescription, setTokenDescription] = useState("")
    const [showModal, setShowModal] = useState(false)
    const hideModal = () => setShowModal(false)
    //////////////////////////////////////////////////////////////////////////////////////////////
    //useNotification
    //////////////////////////////////////////////////////////////////////////////////////////////
    const dispatch = useNotification()
    //////////////////////////////////////////////////////////////////////////////////////////////
    //declaration of the function that uses useWeb3Contract to call tokenURI from our BasicNft.sol
    //////////////////////////////////////////////////////////////////////////////////////////////
    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: BasicNftABI,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: tokenId,
        },
    })

    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: NFTMarketABI,
        contractAddress: marketplaceAddress,
        functionName: "buyItem",
        msgValue: price,
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
        },
    })
    //////////////////////////////////////////////////////////////////////////////////////////////
    //Function that executes when user connects his Web3 wallet, it queries the SmartContract for URI info
    //sets image url, name and description as state variables
    //////////////////////////////////////////////////////////////////////////////////////////////
    async function updateUI() {
        const tokenURI = await getTokenURI()

        //ipfs gateway: everyone should be able to see the nfts
        if (tokenURI) {
            const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            const tokenURIResponse = await (await fetch(requestURL)).json() //first await to fetch the response JSON metadata object, await to .json it
            const imageURI = tokenURIResponse.image //we get the image tag from the json object
            const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            setImageURI(imageURIURL)
            //this is not the best way to do it:
            //we could render the image on the moralis server, and just call the server
            // we could use moralis hooks: useNFTBalances() , but it only works on testnets and mainnet
            setTokenName(tokenURIResponse.name)
            setTokenDescription(tokenURIResponse.description)
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    //////////////////////////////////////////////////////////////////////////////////////////////
    //onClick of the Web3UIkit Card, it will show the component updateListingModal if user is owner
    //////////////////////////////////////////////////////////////////////////////////////////////
    const handleCardClick = () => {
        console.log("handleCardClick")
        isOwnedByUser
            ? setShowModal(true)
            : buyItem({
                  onError: (error) => console.log(error),
                  onSuccess: handleBuyItemSuccess,
              })
    }
    /////////////////////////////////////////////////////////////////////////////
    //we create a notification on success using web3UIkit useNotification
    //import use notification and wrap body of _app.js with NotificationProvider
    /////////////////////////////////////////////////////////////////////////////

    const handleBuyItemSuccess = () => {
        dispatch({
            type: "success",
            message: "Item bought!",
            title: "Item bought!",
            position: "topR",
        })
    }
    const isOwnedByUser = seller === account || seller === undefined //we import account from useMoralis
    const formattedSellerAddress = isOwnedByUser ? "you" : truncateStr(seller || "", 15)

    return (
        <div>
            <div>
                {imageURI ? (
                    <div>
                        <UpdateListingModal
                            isVisible={showModal}
                            tokenId={tokenId}
                            marketplaceAddress={marketplaceAddress}
                            nftAddress={nftAddress}
                            onClose={hideModal}
                        />
                        <Card
                            title={tokenName}
                            description={tokenDescription}
                            onClick={handleCardClick}
                        >
                            <div className="p-7 ">
                                <div className="flex flex-col items-end gap-2">
                                    <div class="font-mono">#{tokenId}</div>
                                    <div className="italic text-sm font-mono">
                                        Owned by {formattedSellerAddress}
                                    </div>
                                    <Image
                                        loader={() => imageURI}
                                        src={imageURI}
                                        height="200"
                                        width="200"
                                    />
                                    <div className="fond-bold font-mono">
                                        {ethers.utils.formatUnits(price, "ether")} ETH
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div class="font-mono"> loading...</div>
                )}
            </div>
        </div>
    )
}
