/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import singlePlayerLogo from '../../assets/one-player-game-symbol.png';
import multiPlayerLogo from '../../assets/network_icon.png';
import './Home.css';
import { auth, db, logout } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

import { Button, Modal, Form } from 'react-bootstrap';

import { doc, setDoc, collection, query, where, getDocs, getDoc } from "firebase/firestore"; 

export default function Home() {

    var lobbyId = 0;
    var isMultiplayer = false;

    const history = useHistory();
    const [name, setName] = useState("");
    const [multiPlayerGameCode, setMultiPlayerGameCode] = useState(0);

    const [user, loading, error] = useAuthState(auth);
    const [userDocumentId, setUserDocumentId] = useState(0);

    const [inviteCodeInput, setInviteCodeInput] = useState("");

    const [popupShow, setPopupShow] = useState(false);

    const handlePopupClose = () => setPopupShow(false);
    const handlePopupShow = () => setPopupShow(true);

    
    const fetchUserName = async () => {
        try {
          const query = await db
            .collection("users")
            .where("uid", "==", user?.uid)
            .get();
          const data = await query.docs[0].data();
          setUserDocumentId(query.docs[0].id);
          setName(data.name);
        } catch (err) {
          console.error(err);
        }
      };

    async function singlePlayerButtonClick () { 
        lobbyId = generateRandomLobbyCode();
        //setMultiPlayerGameCode(lobbyId);
        isMultiplayer = false;
        await setDoc(doc(db, "lobbies", `${lobbyId}`), {
            inviteCode: lobbyId,
            isActive: false,
            isGameStarted: false,
            isMultiplayer: false,
            currentRound: "",
            trueLocations: [],
            gameState: "Lobby",
            noRounds: 5,
            timeLimit: 60,
            enableZooming: false,
            enableMovement: false
        });
        await setDoc(doc(db, "lobbies/" + lobbyId + "/gameUsers", `${userDocumentId}`), {
            userId: db.doc('users/' + userDocumentId),
            userName: localStorage.getItem("userName"),
            isHost: true,
            guessedLocations: [],
            distances: [],
            scores: [],
            totalScore: "",
            isClickedGuess: ""
        });

        //let data = {lobbyId:lobbyId, userId: userDocumentId};

        history.push({
            pathname: `/GameLobby`,
            state: { lobbyId: lobbyId, isMultiplayer: isMultiplayer }
            /* ,
            state: data */
        });
    }

    async function joinExistingMultiplayerLobbyButtonClick() {
        var lobbyFound = false;
        isMultiplayer = true;
        const queryResult = await query(collection(db, "lobbies"), where("isActive", "==", true), where("isMultiplayer", "==", true));
        const querySnapshot = await getDocs(queryResult);
        if (querySnapshot.empty) {
            alert("no active lobbies. check next time!");
            return;
        }
        else {
            querySnapshot.forEach((doc) => {
                if (doc.id === inviteCodeInput) {
                    lobbyFound = true;
                    lobbyId = doc.id;
                    console.log("A lobby with given code found.");
                }
            });

            if (lobbyFound) {
                // get lobby currentRound
                const docRef = doc(db, "lobbies", `${lobbyId}`);
                const docSnap = await getDoc(docRef);
                const {currentRound:currR,gameState} = docSnap.data();

                if(gameState === "RoundPlay"){
                    alert("Round is already started, you can join next round !")
                }
                else{
                    // add nulls to db for missed rounds
                    let missedLocs = [];
                    let missedDists= [];
                    let missedScores =[];
                    
                    for(let i =0; i<currR; i++){
                        missedLocs.push(null);
                        missedDists.push("null");
                        missedScores.push(0);
                    }

                    setDoc(doc(db, "lobbies/" + lobbyId + "/gameUsers", `${userDocumentId}`), {
                        userId: db.doc('users/' + userDocumentId),
                        userName: localStorage.getItem("userName"),
                        isHost: false,
                        guessedLocations: missedLocs,
                        distances: missedDists,
                        scores: missedScores,
                        totalScore: "",
                        isClickedGuess: false
                    });
                    //setMultiPlayerGameCode(lobbyId);
                    
                    let path = `/GameLobby`;
                    history.push({
                        pathname: path,
                        state: { lobbyId: lobbyId, isMultiplayer: isMultiplayer }
                    });

                    }

            }
            if (!lobbyFound) {
                alert("No lobbies exist with code: " + inviteCodeInput);
                return;
            }
        }

    }

    function generateRandomLobbyCode() {
        return Math.floor(100000000 + Math.random() * 900000000); 
    }

    //below code creates a new db game instance once user creates a new lobby.
    //user will be the host, hence have permission to change game settings and rules.
    async function createNewMultiplayerLobbyButtonClick () {
        lobbyId = generateRandomLobbyCode();
        //setMultiPlayerGameCode(lobbyId);
        isMultiplayer = true;
        // console.log(multiPlayerGameCode);
        // console.log(userDocumentId);
        await setDoc(doc(db, "lobbies", `${lobbyId}`), {
            inviteCode: lobbyId,
            isActive: true,
            isGameStarted: false,
            isMultiplayer: true,
            currentRound: "",
            trueLocations: [],
            gameState: "Lobby",
            noRounds: 5,
            timeLimit: 60,
            enableZooming: false,
            enableMovement: false
        });
        await setDoc(doc(db, "lobbies/" + lobbyId + "/gameUsers", `${userDocumentId}`), {
            userId: db.doc('users/' + userDocumentId),
            userName: localStorage.getItem("userName"),
            isHost: true,
            guessedLocations: [],
            distances: [],
            scores: [],
            totalScore: "",
            isClickedGuess: ""
        });
        let path = `/GameLobby`;
        history.push({
            pathname: path,
            state: { lobbyId: lobbyId, isMultiplayer: isMultiplayer }
        });
    }
    
    useEffect(() => {
        fetchUserName();
        if (loading) return;
        if (!user) return history.replace("/");
    }, [user, loading])

    return (<>

        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <a class="navbar-brand" href="/">Geofinder</a>
            <i class="icon-help fas fa-question fa-2x"></i>
            <i class="icon-language fas fa-language fa-2x"></i>

            <div class="container home-top-right-flex-container flex-container justify-content-end">
                <button type="button" class="btn btn-primary btn-gamehistory">Game History</button>
                <div class="dropdown">
                    <button class="btn btn-secondary btn-profile dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {localStorage.getItem("userName")}
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                        <li><a class="dropdown-item" href="/accountDetails">Account Details</a></li>
                        <li><a class="dropdown-item" href="/stats">Stats</a></li>
                        <li><a class="dropdown-item" href="/" onClick={logout}>Logout</a></li>
                    </ul>
                    {/* <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        <a class="dropdown-item" href="/accountDetails">Account Details</a>
                        <a class="dropdown-item" href="/stats">Stats</a>
                        <a class="dropdown-item" href="/" onClick={logout}>Logout</a>
                    </div> */}
                </div>
            </div>

        </nav>

        <div className="home-main" style={{ height:"680px" }}>
            <div class="row" style={{ paddingTop:"9%", paddingLeft: "11%", width:"fitContent" }}>
                <div class="col-sm-3">
                    <div class="card" style={{ height: "400px", backgroundColor: "gainsboro", color: "white", cursor: "pointer" }} onClick={singlePlayerButtonClick}>
                        <h1 style={{ textAlign: "center" }}>Single Player</h1>
                        <img src={singlePlayerLogo} width="80%" class="sp-image image"></img>
                    </div>
                </div>
                <div class="col-sm-3" style={{ marginLeft: "2%" }}>
                    <div class="card" style={{ height: "400px", backgroundColor: "gainsboro", color: "white", cursor: "pointer" }} onClick={handlePopupShow}>
                        <h1 style={{ textAlign: "center" }}>Multiplayer</h1>
                        <img src={multiPlayerLogo} width="80%" class="mp-image image"></img>
                    </div>
                </div>
                <Modal show={popupShow} style={{ marginTop: "15%" }} onHide={handlePopupClose}>
                    <Modal.Header closeButton>
                        <h1 style={{ textAlign: "center" }}>Multiplayer</h1>
                    </Modal.Header>
                    <Modal.Body>
                        <a>Enter lobby link: </a>
                        <input type="text" id="lobbyLinkTextBox" name="fname" value={inviteCodeInput} onChange={(event) => setInviteCodeInput(event.target.value)} onInput={(event) => setInviteCodeInput(event.target.value)}></input>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="success" onClick={createNewMultiplayerLobbyButtonClick}>
                            Create new Lobby
                        </Button>
                        <Button variant="danger" onClick={joinExistingMultiplayerLobbyButtonClick} disabled={inviteCodeInput === ""}>
                            Join an existing Lobby
                        </Button>
                    </Modal.Footer>
                </Modal>
                <div class="col-sm-4" style={{ marginLeft: "10%", marginTop: "-3%" }}>
                    <div class="card" style={{ height: "500px" }}>
                        <h2 style={{ textAlign: "center" }}>Scoreboard</h2>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Username</th>
                                    <th scope="col">Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th scope="row">1</th>
                                    <td>Berat</td>
                                    <td>3000</td>
                                </tr>
                                <tr>
                                    <th scope="row">2</th>
                                    <td>Serdar</td>
                                    <td>2000</td>
                                </tr>
                                <tr>
                                    <th scope="row">3</th>
                                    <td>Arman</td>
                                    <td>1000</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
        




    </>)

}