import React, { Component } from "react";
import * as $ from "jquery";
import { authEndpoint, clientId, redirectUri, scopes } from "./config";
import hash from "./hash";
import Player from "./Player";
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
      my_data_collected: false,
      friend_data_collected: false,
      playlists_combined: false,
      friendssongs: new Set(),
      mysongs: new Set()
    };

    //this.getCurrentlyPlaying = this.getCurrentlyPlaying.bind(this);
    this.getAllMySongs = this.getAllMySongs.bind(this);
    this.getFriendsSongs = this.getFriendsSongs.bind(this);
    this.getAllSongsFromMyPlaylists = this.getAllSongsFromMyPlaylists.bind(this);
    this.getAllSongsFromFriendsPlaylists = this.getAllSongsFromFriendsPlaylists.bind(this);
    this.combinePlaylists = this.combinePlaylists.bind(this);
    this.startSequence = this.startSequence.bind(this);
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
      //this.getAllMySongs(_token);
      console.log("mounted");
    }

    this.getAllMySongs(this.state.token);

    // set interval for polling every 5 seconds
    this.interval = setInterval(() => this.tick(), 5000);
  }

  componentWillUnmount() {
    // clear the interval to save resources
    clearInterval(this.interval);
  }

  tick() {
    if(this.state.token) {
      //this.getAllPlaylists(this.state.token);
      //this.getCurrentlyPlaying(this.state.token);
      this.combinePlaylists();
    }
  }
  
    
    
  getFriendsSongs(token, userid) {
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
          //friendssongs:new Set()
                        
        });
        this.getAllSongsFromFriendsPlaylists(token);
        
      }
    });
  }

  getAllSongsFromFriendsPlaylists(token) {

    for (let i = 0; i < this.state.user2playlists.length; i++) {
      //console.log(id);
          if (i === this.state.user2playlists.length - 1) {
            $.ajax({
           url: "https://api.spotify.com/v1/playlists/"+this.state.user2playlists[i]+"/tracks",
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
             for (var i = 0; i < data.items.length; i++) {
               //change to a setState function
              this.state.friendssongs.add(data.items[i].track.name);
             }
            
     
           }
         }).then(this.setState({friend_data_collected:true}));
          }
          else {
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
                 friend_data_collected: false,
               });
               return;
             }
             for (var i = 0; i < data.items.length; i++) {
               //change to a setstate function
                this.state.friendssongs.add(data.items[i].track.name);
             }
            
     
           }
          });
          }
         
       }
       console.log("here");
       console.log("friend", this.state);
       this.combinePlaylists();
       //console.log("user2", this.state);
       //var intersection = this.state.songs.filter(x => this.state.user2songs.has(x));
       //console.log(this.state.songs);
       //console.log(this.state.user2songs);
       //console.log("heyyyy", this.state);
    /*this.setState({
      intersection: intersection
    })*/

     }
  
  

  getAllMySongs(token) {
    console.log("here1");
    // Make a call using the token
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
          myplaylists: playlists,
          //mysongs:new Set(),
          no_data: false /* We need to "reset" the boolean, in case the
                            user does not give F5 and has opened his Spotify. */
                        
        });

        this.getAllSongsFromMyPlaylists(token);
      }
    });
  
  }

  getAllSongsFromMyPlaylists(token) {
    console.log("here2");
    for (let i = 0; i < this.state.playlists.length; i++) {
   //console.log(id);
   if (i === this.state.playlists.length - 1) {
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
          for (var i = 0; i < data.items.length; i++) {
            //change to a setstate function
            this.state.mysongs.add(data.items[i].track.name);
          }
        
  
        }
      }).then(this.setState({my_data_collected: true}));
   }
   else {
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
          for (var i = 0; i < data.items.length; i++) {
            //change to a setstate function
            this.state.mysongs.add(data.items[i].track.name);
          }
        
  
        }
      });
      }
    }
    this.getFriendsSongs(token, "mic_hell_e");


  }


  getCurrentlyPlaying(token) {
    //console.log("bla");
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
    var intersection = new Set();
    var i = 0;
    console.log(this.state.mysongs)
    
    for (var x of this.state.friendssongs) {
      i++;
      if (this.state.mysongs.has(x)) {
        intersection.add(x);
      }
    }

    var songs = "";
    for (var song of intersection) {
      songs += song + " , ";
    }
    this.setState(
      {intersection: songs + intersection.size}
    )

    //var intersection = this.state.songs.filter(x => this.state.user2songs.has(x));
    //(x => this.state.allsongs[1].has(x));

  }

  startSequence() {
    console.log("hi");
    this.getAllMySongs(this.state.token);
  }







  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
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

          <button onClick={this.startSequence}>
            Activate Lasers
          </button>


         
          
          <div>{this.state.intersection}</div>
          
          {this.state.token && !this.state.no_data && (
            <Player
              item={this.state.item}
              is_playing={this.state.is_playing}
              progress_ms={this.state.progress_ms}
            />
          )}
          {this.state.no_data && (
            <p>
              You need to be playing a song on Spotify, for something to appear here.
            </p>
          )}
        </header>
      </div>
    );
  }
}

export default App;
