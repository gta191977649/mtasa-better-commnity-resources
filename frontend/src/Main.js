import React, { Component } from 'react';
import './App.css';

const MTA_HOME = "https://community.multitheftauto.com/"
class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            resources: [],
            total: 0,
            searchTerm: "",
            more: 0,
            loadedPage: 1,
        }
    }
    calcMaxPage(total) {
        return total/20 > Math.floor(total/20) ? Math.floor(total/20) + 1 : Math.floor(total/20)
    }
    async searchResrouces(page = 1){
        let data = this.state.resources
        let query = `http://127.0.0.1:5000/search?key=${this.state.searchTerm}&page=${page}`
        console.log(query)
        await axios.get(query).then(e=>{

            for(let i=0;i< e.data.data.length;i++) {
                data.push({
                name:e.data.data[i].name,
                href:e.data.data[i].href,
                des:e.data.data[i].des,
                type:e.data.data[i].type,
                id:e.data.data[i].id,
                img:"fetch image...",
                })
            }
            this.setState({
              resources:data,
              total:e.data.total,
              loadedPage: this.state.loadedPage < calcMaxPage(e.data.total) ? 1 : 0
            })
          console.log(`Set has more = ${this.state.loadedPage < calcMaxPage(e.data.total)}`)
    
        })
    }
    render() { 
        let result = this.state.resources.map((e,idx)=>(
            <tr key={idx}>  
              <td>{e.name}</td>
              <td>{e.des}</td>
              <td>{e.type}</td>
              <td>{e.img}</td>
              <td><a href={MTA_HOME+e.href}>View</a></td>
            </tr>
        ))
        return ( 
            <div className="App">
                    <h1>Better MTA-SA Commnity Resrouce Search</h1>
                <input type="text" placeholder="Search term"/>
                <button>Search!</button>
                <p>Total</p>
                <p>HasMore: </p>

                <table className="table mt-3">
                <thead>
                    <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Image</th>
                    <th>Detail</th>
                    </tr>
                </thead>
                <tbody>
                {result}
                </tbody>
                </table>


            </div>
        );
    }
}
 
export default Main;