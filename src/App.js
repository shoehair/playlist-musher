import React, { Component } from "react";
import * as $ from "jquery";
import { authEndpoint, clientId, redirectUri, scopes } from "./config.js";
import hash from "./hash";
import Player from "./Player";
import ProgressBar from "./ProgressBar"
import Song from "./Song";
import NameForm from "./NameForm"
import logo from "./logo.svg";
import "./App.css";

class App extends Component {
  constructor() {
    super();
    this.state = {
      token: null,
      item: {
        album: {
          images: [{ url: "" }]
        },
        name: "",
        artists: [{ name: "" }],
        duration_ms: 0
      },
      
      is_playing: "Paused",
      progress_ms: 0,
      no_data: false,
      friendssongs: new Set(),
      mysongs: new Set(),
      myprogress: 0,
      friendprogress:0,
      friend: "",
      intersection: new Set(),
      songsChosen: new Set(),
      playlists: [],
      friendsplaylists: []
    };

    //this.getCurrentlyPlaying = this.getCurrentlyPlaying.bind(this);
    this.getmysongs = this.getmysongs.bind(this);
    this.getFriendsSongs = this.getFriendsSongs.bind(this);
    this.getMySongsFromPlaylists = this.getMySongsFromPlaylists.bind(this);
    this.getAllSongsFromFriendsPlaylists = this.getAllSongsFromFriendsPlaylists.bind(this);
    this.combinePlaylists = this.combinePlaylists.bind(this);
    this.getCommonSongs = this.getCommonSongs.bind(this);
    this.dotheThing = this.doTheThing.bind(this);
    this.handleNameFormChange = this.handleNameFormChange.bind(this);
    this.updateSongsAdded = this.updateSongsAdded.bind(this);
    this.createPlaylist = this.createPlaylist.bind(this);
    //this.testPlaylist = this.testPlaylist.bind(this);
    this.tick = this.tick.bind(this);
  }



  componentDidMount() {
    // Set token
    let _token = hash.access_token;

    if (_token) {
      // Set token
      this.setState({
        token: _token
      });
      
      //this.getCommonSongs("mic_hell_e", _token);
      //this.combinePlaylists(_token);
      console.log("mounted");
      this.combinePlaylists();
    }

    // set interval for polling every 5 seconds
    this.interval = setInterval(() => this.tick(), 5000);
  }

  componentWillUnmount() {
    // clear the interval to save resources
    clearInterval(this.interval);
  }

  tick() {
    if(this.state.token) {
      this.combinePlaylists();
    }
    console.log(this.state.myprogress + this.state.friendprogress + "  " + this.state.playlists.length + this.state.friendsplaylists.length);
  }

  handleNameFormChange(name) {
    this.setState({friend: name})
  }

  doTwoThings() {
    /*this.setState({intersection: new Set()});
    this.setState({friendssongs: new Set()});
    this.doTheThing();
    this.doTheThing();*/
    this.doTheThing();
  }

  doTheThing(){
    console.log(this.state.token);
    console.log(this.state.friend);
    this.setState({friendssongs: new Set(),
                  myprogress: 0,
                  friendprogress:0,
                  playlists:[],
                  friendsplaylists: []})
    if (this.state.friend != "") {
      this.getmyinfo(this.state.token);
      this.getCommonSongs(this.state.friend, this.state.token);
    }
    //this.getCommonSongs("mic_hell_e", this.state.token);
  }

  getCommonSongs(friend, token) {

    this.getmysongs(token);
    this.setState({friend: friend}, () => {
      this.getFriendsSongs(token, friend);
    })
    
  }

  getmyinfo(token) {
    $.ajax({
      url: "https://api.spotify.com/v1/me",
      type: "GET",
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      success: data => {
        // Checks if the data is not empty
        if(!data) {
          this.setState({
            no_data: true,
          });
          return;
        }
        this.setState({
          myInfo: data                      
        });
      }
    });
  }
  
  getmysongs(token) {
    // Make a call using the token
    console.log("getMySongs");

    $.ajax({
      url: "https://api.spotify.com/v1/me/playlists",
      type: "GET",
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      success: data => {
        // Checks if the data is not empty
        if(!data) {
          this.setState({
            no_data: true,
          });
          return;
        }
        var playlists = [];
        for (var i = 0; i < data.items.length; i++) {
          playlists.push(data.items[i].id);
        }

        this.setState({
          playlists: playlists,
          no_data: false /* We need to "reset" the boolean, in case the
                            user does not give F5 and has opened his Spotify. */
                        
        });

        this.getMySongsFromPlaylists(token);
      }
    });
  
  }

  getMySongsFromPlaylists(token) {
    console.log("getMySongsFromPlaylists");
    for (let i = 0; i < this.state.playlists.length; i++) {
   //console.log(id);
      $.ajax({
        url: "https://api.spotify.com/v1/playlists/"+this.state.playlists[i]+"/tracks",
        async: true,
        type: "GET",
        beforeSend: xhr => {
          xhr.setRequestHeader("Authorization", "Bearer " + token);
        },
        error: error => {
          console.log(error);
        },
        success: data => {
          // Checks if the data is not empty
          if(!data) {
            this.setState({
              no_data: true,
            });
            return;
          }
          var songs = this.state.mysongs;
          for (var i = 0; i < data.items.length; i++) {
            songs.add(JSON.stringify(data.items[i].track));
          }
          this.setState({myprogress: this.state.myprogress + 1});
          console.log(i);
        
  
        }

      });
    }

  }
    
  getFriendsSongs(token, userid) {
    console.log("getfriendssongs");
    $.ajax({
      url: "https://api.spotify.com/v1/users/" + userid + "/playlists",
      type: "GET",
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      success: data => {
        // Checks if the data is not empty
        if(!data) {
          this.setState({
            no_data: true,
          });
          return;
        }
        var playlists = [];
        
        for (var i = 0; i < data.items.length; i++) {
          playlists.push(data.items[i].id);
        }

        this.setState({
          friendsplaylists: playlists,
          no_data: false /* We need to "reset" the boolean, in case the
                            user does not give F5 and has opened his Spotify. */
                        
        });
        this.getAllSongsFromFriendsPlaylists(token);
      },
      error: function(xhr, status, error){
         var errorMessage = xhr.status + ': ' + xhr.statusText
         if (xhr.status == 404) {
            alert("User with user ID does not exist");
            //I bound this but for some reason it's getting overwritten??
            this.setState({friend: ""});
         }
      }.bind(this)
    });
  }

  getAllSongsFromFriendsPlaylists(token) {
    console.log("getAllSongsFromFriendsPlaylists");
    for (let i = 0; i < this.state.friendsplaylists.length; i++) {
      //console.log(id);
         $.ajax({
           url: "https://api.spotify.com/v1/playlists/"+this.state.friendsplaylists[i]+"/tracks",
           async: true,
           type: "GET",
           beforeSend: xhr => {
             xhr.setRequestHeader("Authorization", "Bearer " + token);
           },
           error: error => {
             console.log(error);
           },
           success: data => {
             // Checks if the data is not empty
             if(!data) {
               this.setState({
                 no_data: true,
               });
               return;
             }
             var songs = this.state.friendssongs;
             for (var i = 0; i < data.items.length; i++) {
               songs.add(JSON.stringify(data.items[i].track));
             }
            
     
           }
         });
         this.setState({friendprogress: this.state.friendprogress + 1});
       }

       this.combinePlaylists();
     }


  getCurrentlyPlaying(token) {
    //console.log("get cu");
    // Make a call using the token
    $.ajax({
      url: "https://api.spotify.com/v1/me/player",
      type: "GET",
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      success: data => {
        // Checks if the data is not empty
        if(!data) {
          this.setState({
            no_data: true,
          });
          return;
        }

        this.setState({
          item: data.item,
          is_playing: data.is_playing,
          device_name: data.device.name,
          progress_ms: data.progress_ms,
          no_data: false
                        
        });
      }
    });
  }


  
  combinePlaylists() {
    this.setState({poop: "poop"});
    var intersection = new Set();

    var i = 0;
    for (var x of this.state.friendssongs) {
      i++;
      if (this.state.mysongs.has(x)) {
        var json = eval('('+ x +')' );;
        intersection.add(json);
      }
    }

    console.log(this.state.friendssongs);
    console.log(this.state.mysongs);

    console.log([...intersection][0]);


    var songs = "";
    for (var song of intersection) {
      songs += song + " , ";
    }
    this.setState(
      {intersection: intersection}
    )
  }

  updateSongsAdded(songs_added) {
    console.log("current songs chosen");
    console.log(songs_added);
    this.setState({songsChosen: songs_added});
  }

  createPlaylist(token){
    console.log("creating playlist...");
    console.log(this.state.songsChosen);

    var user_id = this.state.myInfo.id;
    var user_name = this.state.myInfo.display_name;
    $.ajax({
      url: "https://api.spotify.com/v1/users/" + user_id + "/playlists",
      type: "POST",
      data: JSON.stringify({
        "name": user_name + "'s and " + this.state.friend +"'s combined playlist",
        "description": "You made this playlist using SpotifyMusher!",
        "public": true
      }),
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      error: function(xhr, error){
        console.log("error");
        console.log(xhr);
        console.log(error);
      },
      success: data => {
        this.setState({
          playlist: data             
        });
        //add all songs to the playlist
        var songsToAdd = [];
        for(let object of this.state.songsChosen) {
          songsToAdd.push(object.uri);
        }
          $.ajax({
            url: "https://api.spotify.com/v1/playlists/" + this.state.playlist.id + "/tracks",
            async: true,
            type: "POST",
            data: JSON.stringify({
              "uris": songsToAdd,
            }),
            beforeSend: xhr => {
              xhr.setRequestHeader("Authorization", "Bearer " + token);
            },
            error: error => {
              console.log(error);
            },
            success: data => {
              // Checks if the data is not empty
              if(!data) {
                this.setState({
                  no_data: true,
                });
                return;
              }

            }
          });
      }
    });
  }

//<div>{this.state.intersection}</div>

  render() {
    return (
      <div className="App">
        <header className="App-header">
        <div class="content">
          <h2 class="text_shadows">SPOTIFY MUSHER</h2>
        </div>
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          
          <div className="text-container">
            <div> The intersection of your and </div> <div className="underlined">{this.state.friend == "" ? " __________" : this.state.friend}</div><div>'s songs </div>
          </div>

          {!this.state.token && (
            <a
              className="btn btn--loginApp-link"
              href={`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
                "%20"
              )}&response_type=token&show_dialog=true`}
            >
              Login to Spotify
            </a>
          )}

          
          
          

          
          {this.state.token && !this.state.no_data && (
            <Player
              item={this.state.item}
              is_playing={this.state.is_playing}
              progress_ms={this.state.progress_ms}
              songs={[...this.state.intersection]}
              foundASong={this.state.intersection.size > 0}
              func={this.updateSongsAdded}
              totalmyplaylists={this.state.playlists.length}
              totalfriendplaylists={this.state.friendsplaylists.length}
              myplaylistsdone={this.state.myprogress}
              friendplaylistsdone={this.state.friendprogress}
            />
          )}


          {this.state.token && !this.state.no_data && (
            <NameForm
            onValueChange={this.handleNameFormChange}
            onSubmit={() => this.doTwoThings()}
            />
          )}

          {this.state.token != null && 
            <button className="cute-button" onClick={() => this.doTwoThings()}>
              doTheThing
            </button>
          
          }

          {this.state.token != null && 
          this.state.friendsplaylists.length != 0 &&
          this.state.myprogress + this.state.friendprogress == this.state.playlists.length+ this.state.friendsplaylists.length &&
          this.state.intersection.size != 0 &&
            <button className="cute-button big-margin" onClick={() => this.createPlaylist(this.state.token)}>
              create playlist
            </button>
          }

          {this.state.token && !this.state.no_data && (
            <ProgressBar
              totalmyplaylists={this.state.playlists.length}
              totalfriendplaylists={this.state.friendsplaylists.length}
              myplaylistsdone={this.state.myprogress}
              friendplaylistsdone={this.state.friendprogress}
            />
          )}
        </header>
      </div>
    );
  }
}

export default App;
