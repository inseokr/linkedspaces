import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react'

const wrapperStyles = {
    width: "100%",
    margin: "0 auto",
}

const AnyReactComponent = ({ text }) => <div>{text}</div>;

class MapView extends Component {
    constructor(props) {
        super(props);
        // this.state = {
        //     center: {
        //         lat:37.338207,
        //         lng:-121.886330
        //     },
        //     zoom: 9
        // }
        // this.handleZoomIn = this.handleZoomIn.bind(this);
        // this.handleZoomOut = this.handleZoomOut.bind(this);
        // this.handleClusterClick = this.handleClusterClick.bind(this);
        // this.handleReset = this.handleReset.bind(this)
    }

    // handleZoomIn() {
    //     const {center,zoom,updateMapState} = this.props;
    //     updateMapState(center,zoom*2,(20*(1/zoom*2)));
    // }
    //
    // handleZoomOut() {
    //     const {center,zoom,updateMapState} = this.props;
    //     updateMapState(center,zoom/2,(20*(1/zoom/2)));
    // }

    // handleClusterClick(cluster) {
    //     const {updateMapState,toggleMap} = this.props;
    //     updateMapState(cluster.coordinates,3,(20*(1/3)));
    //     toggleMap(cluster.region); // This triggers the toggle change in the header And also updates the region filter.
    // }
    //
    // handleReset() {
    //     const {updateMapState} = this.props;
    //     updateMapState([0,20],1,20);
    // }

    render() {
        const {center, zoom, labelStyle} = this.props;
        return (
            <div style={{ height: '100vh', width: '100%' }}>
                <GoogleMapReact
                    bootstrapURLKeys={{ key: "AIzaSyBb4-4o95v1MrQRHVdMn-yqHwv6eGnU2r8" }}
                    defaultCenter={center}
                    defaultZoom={zoom}
                >
                    <AnyReactComponent
                        lat={37.338207}
                        lng={-121.886330}
                        text="San Jose"
                    />
                </GoogleMapReact>
            </div>
        );
    }
}

export default MapView

