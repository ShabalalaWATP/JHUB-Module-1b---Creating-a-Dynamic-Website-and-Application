// App.jsx file
import { useState, useEffect } from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CrimeMap } from './components/CrimeMap'; // Import the CrimeMap component

export default function App() {
  const [darkMode, setDarkMode] = useState(false); // Moved darkMode state here
  const [forces, setForces] = useState([]);
  const [selectedForce, setSelectedForce] = useState('');
  const [neighbourhoods, setNeighbourhoods] = useState([]);
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState('');
  const [neighbourhoodData, setNeighbourhoodData] = useState(null);
  const [crimeStats, setCrimeStats] = useState([]);
  const [boundaryData, setBoundaryData] = useState(null); // New state for boundary data
  const [crimeData, setCrimeData] = useState([]); // New state for raw crime data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // First useEffect - Fetch forces
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch('https://data.police.uk/api/forces', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        setForces(data);
        setLoading(false);
      })
      .catch(err => {
        setError(`Failed to fetch police forces: ${err.message}`);
        setLoading(false);
      });
  }, []);

  // Second useEffect - Fetch neighbourhoods
  useEffect(() => {
    if (selectedForce) {
      setLoading(true);
      setError(null);

      fetch(`https://data.police.uk/api/${selectedForce}/neighbourhoods`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return response.json();
        })
        .then(data => {
          setNeighbourhoods(data);
          setLoading(false);
        })
        .catch(err => {
          setError(`Failed to fetch neighbourhoods: ${err.message}`);
          setLoading(false);
        });
    }
  }, [selectedForce]);

  // Third useEffect - Fetch neighbourhood details and crime stats
  useEffect(() => {
    if (selectedForce && selectedNeighbourhood) {
      setLoading(true);
      setError(null);

      // First fetch neighbourhood details
      fetch(`https://data.police.uk/api/${selectedForce}/${selectedNeighbourhood}`)
        .then(response => {
          if (!response.ok) throw new Error(`Failed to fetch details: ${response.status}`);
          return response.json();
        })
        .then(details => {
          // Then fetch team data
          return fetch(`https://data.police.uk/api/${selectedForce}/${selectedNeighbourhood}/people`)
            .then(response => {
              if (!response.ok) throw new Error(`Failed to fetch team: ${response.status}`);
              return response.json().then(team => ({ details, team }));
            });
        })
        .then(data => {
          // Then fetch events
          return fetch(`https://data.police.uk/api/${selectedForce}/${selectedNeighbourhood}/events`)
            .then(response => {
              if (!response.ok) throw new Error(`Failed to fetch events: ${response.status}`);
              return response.json().then(events => ({
                details: data.details,
                team: data.team,
                events
              }));
            });
        })
        .then(data => {
          setNeighbourhoodData(data);

          // Fetch boundary data
          return fetch(`https://data.police.uk/api/${selectedForce}/${selectedNeighbourhood}/boundary`)
            .then(response => {
              if (!response.ok) throw new Error('Failed to fetch boundary');
              return response.json();
            });
        })
        .then(boundaryData => {
          if (boundaryData.length > 0) {
            setBoundaryData(boundaryData);

            // Limit the polygon to 10 points
            const maxPoints = 10;
            const totalPoints = boundaryData.length;
            const step = Math.ceil(totalPoints / maxPoints);
            const polygonPoints = boundaryData.filter((_, index) => index % step === 0).slice(0, maxPoints);

            const polygon = polygonPoints
              .map(point => `${point.latitude},${point.longitude}`)
              .join(':');

            const date = new Date();
            date.setMonth(date.getMonth() - 6);
            const monthString = date.toISOString().slice(0, 7);

            // Fetch crimes with the limited polygon
            return fetch(
              `https://data.police.uk/api/crimes-street/all-crime?date=${monthString}&poly=${encodeURIComponent(polygon)}`,
              {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                },
              }
            );
          }
          throw new Error('No boundary data available');
        })
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch crime stats');
          return response.json();
        })
        .then(crimeData => {
          setCrimeData(crimeData);

          // Process crime data for statistics
          const crimeCounts = crimeData.reduce((acc, crime) => {
            acc[crime.category] = (acc[crime.category] || 0) + 1;
            return acc;
          }, {});

          const processedStats = Object.entries(crimeCounts)
            .map(([category, count]) => ({
              category: category.replace(/-/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '),
              count
            }))
            .sort((a, b) => b.count - a.count);

          setCrimeStats(processedStats);
        })
        .then(() => {
          setLoading(false);
        })
        .catch(err => {
          console.error('Error:', err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, [selectedForce, selectedNeighbourhood]);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''} bg-gray-100 dark:bg-gray-900 p-4`}>
      <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 text-center mb-8">
          UK Police Data Explorer
        </h1>

 {/* Description Section */}
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 text-center">
  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
    Welcome to the UK Police Data Explorer, created by Alex Orr as part of the JHUB Module 1B - Creating a Dynamic Website & Application.
  </p>
  <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
    <p className="mb-4">
      This interactive application provides real-time access to police force data and detailed crime statistics for England, Wales, and Northern Ireland through the official Police API. Features include:
    </p>
    <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto mb-4">
      <ul className="list-disc pl-5 space-y-2">
        <li>Browse all police forces in England, Wales, and Northern Ireland</li>
        <li>Explore local neighbourhoods</li>
        <li>View neighbourhood policing teams</li>
        <li>Access upcoming community events</li>
        <li>View detailed crime statistics per area</li>
      </ul>
      <ul className="list-disc pl-5 space-y-2">
        <li>Dark/Light mode for comfortable viewing</li>
        <li>Responsive design for all devices</li>
        <li>Real-time data updates</li>
        <li>User-friendly interface</li>
      </ul>
    </div>
    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
      Select a police force below to begin exploring your local policing data.
    </p>
  </div>
</div>


        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {loading && (
          <div className="text-center mb-4 dark:text-gray-300">
            Loading...
          </div>
        )}
        {/* Force Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Select Police Force</h2>
          <select
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={selectedForce}
            onChange={(e) => {
              setSelectedForce(e.target.value);
              setSelectedNeighbourhood('');
              setNeighbourhoodData(null);
              setBoundaryData(null); // Reset boundary data
              setCrimeData([]); // Reset crime data
              setCrimeStats([]); // Reset crime stats
            }}
          >
            <option value="">Select a force</option>
            {forces.map((force) => (
              <option key={force.id} value={force.id}>
                {force.name}
              </option>
            ))}
          </select>
        </div>
        {/* Neighbourhood Selection */}
        {selectedForce && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Select Neighbourhood</h2>
            <select
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={selectedNeighbourhood}
              onChange={(e) => {
                setSelectedNeighbourhood(e.target.value);
                setNeighbourhoodData(null);
                setBoundaryData(null); // Reset boundary data
                setCrimeData([]); // Reset crime data
                setCrimeStats([]); // Reset crime stats
              }}
            >
              <option value="">Select a neighbourhood</option>
              {neighbourhoods.map((neighbourhood) => (
                <option key={neighbourhood.id} value={neighbourhood.id}>
                  {neighbourhood.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Display the data */}
        {neighbourhoodData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Neighbourhood Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Team Members */}
              <div>
                <h3 className="font-semibold mb-2 dark:text-white">Team Members</h3>
                {neighbourhoodData.team.length > 0 ? (
                  <ul className="list-disc pl-5 dark:text-gray-300">
                    {neighbourhoodData.team.map((member, index) => (
                      <li key={index}>{member.name} - {member.rank}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="dark:text-gray-300">No team members listed</p>
                )}
              </div>
              {/* Events */}
              <div>
                <h3 className="font-semibold mb-2 dark:text-white">Upcoming Events</h3>
                {neighbourhoodData.events.length > 0 ? (
                  <ul className="list-disc pl-5 dark:text-gray-300">
                    {neighbourhoodData.events.map((event, index) => (
                      <li key={index}>
                        <strong className="dark:text-white">{event.title}</strong>
                        <div
                          className="text-sm dark:text-gray-400"
                          dangerouslySetInnerHTML={{ __html: event.description }}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="dark:text-gray-300">No upcoming events</p>
                )}
              </div>
            </div>
            {/* Area Information and Priorities */}
            <div className="col-span-full">
              <h3 className="font-semibold mb-2 dark:text-white">About This Area</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                {neighbourhoodData.details?.description ? (
                  <div
                    className="text-gray-600 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: neighbourhoodData.details.description }}
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">No area information available</p>
                )}
              </div>
              {/* Crime Statistics */}
              <div className="mt-6">
                <h4 className="font-medium mb-4 dark:text-white">Crime Map & Statistics (Last Month)</h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  {crimeStats.length > 0 ? (
                    <>
                      {/* Crime Map */}
                      {boundaryData && crimeData && (
                        <div className="mb-6">
                          <CrimeMap
                            boundaryData={boundaryData}
                            crimeData={crimeData}
                            darkMode={darkMode} // Pass darkMode to CrimeMap
                          />
                        </div>
                      )}
                      {/* Bar Chart */}
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={crimeStats}>
                            <XAxis
                              dataKey="category"
                              angle={-45}
                              textAnchor="end"
                              height={100}
                              interval={0}
                              tick={{
                                fill: 'currentColor',
                                className: 'text-gray-600 dark:text-gray-300 text-sm'
                              }}
                            />
                            <YAxis
                              tick={{
                                fill: 'currentColor',
                                className: 'text-gray-600 dark:text-gray-300'
                              }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                            <Legend />
                            <Bar
                              dataKey="count"
                              fill="#3b82f6"
                              name="Number of Incidents"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      {/* Crime Summary */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="dark:text-gray-300">
                          <p className="font-medium">Most Common Crime:</p>
                          <p>{crimeStats[0]?.category}: {crimeStats[0]?.count} incidents</p>
                        </div>
                        <div className="dark:text-gray-300">
                          <p className="font-medium">Total Reported Crimes:</p>
                          <p>{crimeStats.reduce((sum, stat) => sum + stat.count, 0)} incidents</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300 text-center py-8">
                      No crime statistics available for this period
                    </p>
                  )}
                </div>
              </div>
              {/* Contact Information */}
              <div className="mt-4">
                <h4 className="font-medium mb-2 dark:text-white">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Email: </span>
                      {neighbourhoodData.details?.contact_details?.email || 'Not available'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Phone: </span>
                      {neighbourhoodData.details?.contact_details?.telephone || 'Not available'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Facebook: </span>
                      {neighbourhoodData.details?.contact_details?.facebook ? (
                        <a
                          href={neighbourhoodData.details.contact_details.facebook}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Visit Page
                        </a>
                      ) : (
                        'Not available'
                      )}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Twitter: </span>
                      {neighbourhoodData.details?.contact_details?.twitter ? (
                        <a
                          href={`https://twitter.com/${neighbourhoodData.details.contact_details.twitter}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          @{neighbourhoodData.details.contact_details.twitter}
                        </a>
                      ) : (
                        'Not available'
                      )}
                    </p>
                  </div>
                </div>
              </div>
              {/* Priorities */}
              <div className="mt-6">
                <h4 className="font-medium mb-4 dark:text-white">Neighbourhood Priorities</h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  {neighbourhoodData.details?.priorities && neighbourhoodData.details.priorities.length > 0 ? (
                    <ul className="list-disc pl-5 dark:text-gray-300">
                      {neighbourhoodData.details.priorities.map((priority, index) => (
                        <li key={index}>
                          <p className="font-medium">{priority.issue}</p>
                          <p className="text-sm">{priority.action}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300 text-center py-8">
                      No priorities listed for this neighbourhood
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
