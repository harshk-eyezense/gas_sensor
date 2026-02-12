import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Map, Zap, Camera, Mic, Filter, SquareDot, Circle, Hexagon, Cross, FlaskConical } from 'lucide-react';

// Fix for default Leaflet marker icon issues with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


// Mock data for sensor locations and types
const mockSensorLocations = [
    { id: 1, name: 'Sensor 1', type: 'chemical', status: 'active', position: [34.0522, -118.2437] }, // Los Angeles
    { id: 2, name: 'Sensor 2', type: 'video', status: 'at-risk', position: [40.7128, -74.0060] }, // New York
    { id: 3, name: 'Sensor 3', type: 'acoustic', status: 'offline', position: [41.8781, -87.6298] }, // Chicago
    { id: 4, name: 'Sensor 4', type: 'chemical', status: 'active', position: [32.7767, -96.7970] }, // Dallas
    { id: 5, name: 'Sensor 5', type: 'video', status: 'active', position: [33.7490, -84.3880] }, // Atlanta
    { id: 6, name: 'Sensor 6', type: 'acoustic', status: 'at-risk', position: [36.1627, -86.7816] }, // Nashville
];

const sensorIcons = {
    'chemical': new L.Icon({ iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] }),
    'video': new L.Icon({ iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] }),
    'acoustic': new L.Icon({ iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] }),
};

const MapPage = () => {
    const [activeFilters, setActiveFilters] = useState(['chemical', 'video', 'acoustic']);

    const handleFilterChange = (filterType) => {
        setActiveFilters(prevFilters =>
            prevFilters.includes(filterType)
                ? prevFilters.filter(f => f !== filterType)
                : [...prevFilters, filterType]
        );
    };
    
    // Filters based on the `activeFilters` state
    const filteredSensors = mockSensorLocations.filter(sensor => activeFilters.includes(sensor.type));

    return (
        <div className="p-8 space-y-8 h-full flex flex-col">
            <h1 className="text-3xl font-semibold text-slate-800">Live SensorsFusion Map</h1>
            <div className="flex flex-1 rounded-xl shadow-lg overflow-hidden relative">
                <MapContainer 
                    center={[39.8283, -98.5795]} 
                    zoom={4} 
                    className="h-full w-full z-0"
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {filteredSensors.map(sensor => (
                        <Marker key={sensor.id} position={sensor.position} icon={sensorIcons[sensor.type]}>
                            <Popup>
                                <div>
                                    <strong>{sensor.name}</strong><br />
                                    Type: {sensor.type}<br />
                                    Status: {sensor.status}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
                
                {/* Filter and Legend Sidebar */}
                <div className="absolute top-4 right-4 z-10 bg-white p-4 rounded-xl shadow-lg w-72">
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                        <Filter className="h-5 w-5" />
                        <span>Filters</span>
                    </h3>
                    <div className="flex flex-col space-y-2">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={activeFilters.includes('chemical')}
                                onChange={() => handleFilterChange('chemical')}
                                className="form-checkbox text-red-500 rounded"
                            />
                            <FlaskConical className="h-5 w-5 text-red-500" />
                            <span className="text-sm">Chemical Sensors</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={activeFilters.includes('video')}
                                onChange={() => handleFilterChange('video')}
                                className="form-checkbox text-blue-500 rounded"
                            />
                            <Camera className="h-5 w-5 text-blue-500" />
                            <span className="text-sm">Video Sensors</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={activeFilters.includes('acoustic')}
                                onChange={() => handleFilterChange('acoustic')}
                                className="form-checkbox text-green-500 rounded"
                            />
                            <Mic className="h-5 w-5 text-green-500" />
                            <span className="text-sm">Acoustic Sensors</span>
                        </label>
                    </div>
                    
                    <h3 className="text-lg font-semibold mt-6 mb-2 flex items-center space-x-2">
                        <Map className="h-5 w-5" />
                        <span>Legend</span>
                    </h3>
                    <div className="flex flex-col space-y-2">
                         <div className="flex items-center space-x-2">
                             <span className="w-4 h-4 rounded-full bg-green-500"></span>
                             <span className="text-sm">Active</span>
                         </div>
                         <div className="flex items-center space-x-2">
                            <span className="w-4 h-4 rounded-full bg-yellow-500"></span>
                            <span className="text-sm">At-Risk</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-4 h-4 rounded-full bg-red-500"></span>
                            <span className="text-sm">Offline</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapPage;
