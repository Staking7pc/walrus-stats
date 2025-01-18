    import React from 'react'
    import './Cards.css'
    export default function Cards() {
        return (

            <body>
                <div class="container">
                    <div class="heading">
                        <h4>RPC Stats for crossfi</h4>
                    </div>
                    <div class="row">
                        <div class="card">
                            <div class="card-header">
                                <h3>Testnet endpoints</h3>
                            </div>
                            <div class="card-body">
                                <p>
                                    We gather endpoints every day from this github link
                                </p>
                                <a target="_blank" rel="noopener noreferrer" href="" class="btn">Github link</a>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <h3>Mainnet(WIP)</h3>
                            </div>
                            <div class="card-body">
                                <p>
                                    We gather endpoints every day from github of mainnet
                                </p>
                                <a target="_blank" rel="noopener noreferrer" href="" class="btn">Github link</a>
                            </div>
                        </div>                        
                        <div class="card">
                            <div class="card-header">
                                <h3>Update Frequency</h3>
                            </div>
                            <div class="card-body">
                                <p>
                                    We run every 5 minute /abci and /status and publish the results.
                                </p>
                                <a target="_blank" rel="noopener noreferrer" href="" class="btn">Every 5 mins</a>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <h3>Fetch Endpoints</h3>
                            </div>
                            <div class="card-body">
                                <p>
                                    We run a job to fetch all the endpoints from github links every hour. 
                                </p>
                                <a target="_blank" rel="noopener noreferrer" href="" class="btn">Every hour</a>
                            </div>
                        </div>

                    </div>
                </div>
            </body>
        )
    }
