import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactPlayer from "react-player";
import { Box, Button, Card, CardContent, CardActions, Grid, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: "#9c27b0",
    },
    background: {
      default: "#1a1a1a",
      paper: "#2c2c2c",
    },
    text: {
      primary: "#fff",
      secondary: "#fff",
    },
  },
});

function App() {
  const [mainVideo, setMainVideo] = useState("");
  const [likes, setLikes] = useState(0);
  const [videos, setVideos] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await axios.get("http://localhost:8000/videos");
      setVideos(response.data);
      if (response.data.length > 0) {
        setMainVideo(response.data[0].path);
      }
    } catch (error) {
      console.error("Error fetching videos", error);
    }
  };

  const incrementLikes = () => {
    setLikes(likes + 1);
  };

  const onFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const onFileUpload = async () => {
    const formData = new FormData();
    formData.append("video", selectedFile);

    try {
      const response = await axios.post("http://localhost:8000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadMessage(response.data);
      fetchVideos(); // Refresh the video list
    } catch (error) {
      console.error("There was an error uploading the file!", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: "background.default", color: "text.primary", minHeight: "100vh", p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ backgroundColor: "background.paper" }}>
              <ReactPlayer url={`http://localhost:8000${mainVideo}`} controls width="100%" height="500px" />
              <CardContent>
                <Typography variant="h5" component="div">
                  Main Video
                </Typography>
              </CardContent>
              <CardActions>
                <Button variant="contained" color="primary" onClick={incrementLikes}>
                  Like: {likes}
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <input type="file" onChange={onFileChange} style={{ marginBottom: "10px", color: "#fff" }} />
            <Button variant="contained" color="primary" onClick={onFileUpload}>
              Upload
            </Button>
            {uploadMessage && <Typography>{uploadMessage}</Typography>}
          </Grid>
          {videos.slice(0, 4).map((video, index) => (
            <Grid item xs={3} key={index}>
              <Card sx={{ backgroundColor: "background.paper" }}>
                <img
                  src={`http://localhost:8000${video.thumbnail}`}
                  alt={`Thumbnail for ${video.filename}`}
                  onClick={() => setMainVideo(video.path)}
                  style={{ width: "100%", cursor: "pointer" }}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {video.filename}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </ThemeProvider>
  );
}

export default App;
