import React, { Component } from 'react'
import MapView from "./MapView";
import ListView from "./ListView";
import Grid from "@material-ui/core/Grid";
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from '@material-ui/core/Box'

class LandingPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            center: {
                lat:37.338207,
                lng:-121.886330
            },
            zoom: 9,
            labelStyle: {
                fontSize: 20
            },
            testList: [{"name":"Peter Brimer"}, {"name":"Tera Gaona"}, {"name":"Kandy Liston"}]
        };
    }

    render() {
        const {center,zoom,labelStyle,testList} = this.state;
        return (
            <Grid component="main">
                <CssBaseline />
                <Box className="App" component="div" display="flex" flexDirection="column">
                    <Grid container>
                        <Grid item xs={4}>
                            <ListView testList={testList}/>
                        </Grid>
                        <Grid className="map" item xs={8}>
                            <MapView center={center} zoom={zoom} labelStyle={labelStyle}/>
                        </Grid>
                    </Grid>
                </Box>
            </Grid>
        );
    }

}

export default LandingPage;