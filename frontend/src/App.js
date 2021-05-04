import logo from './logo.svg';
import './App.css';
import axios from 'axios'
import React, { useState,useReducer } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import InfiniteScroll from 'react-infinite-scroll-component';

const MTA_HOME = "https://community.multitheftauto.com/"
function App() {
  
  const [total, setTotal] = useState(0);
  const [resources, setRes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
  const [more, setHasMore] = useState(0);
  const [loadedPage, setLoadedPage] = useState(1);

  
  function renderResult() {
    let result = resources.map((e,idx)=>(
      <tr key={idx}>  
        <td>{e.name}</td>
        <td>{e.des}</td>
        <td>{e.type}</td>
        <td>{e.img}</td>
        <td><a href={MTA_HOME+e.href}>View</a></td>
      </tr>
    ))
    return result
  }
  
  function calcMaxPage(total) {
    return total/20 > Math.floor(total/20) ? Math.floor(total/20) + 1 : Math.floor(total/20)
  }
  function fetchMore() {
    if (loadedPage < calcMaxPage(total)) {
      setTimeout(() => {
        setHasMore(1)
        setLoadedPage(loadedPage+1)
        searchResrouces(loadedPage+1)
      }, 500);

      
    }

  }
  async function fetchImages(res_id) {
    return axios.get(`http://127.0.0.1:5000/gallery?id=${res_id}`)
  }
  async function searchResrouces(page = 1){

  
    
    let data = resources
    let query = `http://127.0.0.1:5000/search?key=${searchTerm}&page=${page}`
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
      setRes(data)
      setTotal(e.data.total)

      setHasMore(loadedPage < calcMaxPage(e.data.total) ? 1 : 0)
      console.log(`Set has more = ${loadedPage < calcMaxPage(e.data.total)}`)

    })
    
    


    console.log("Resrouce fetched, try to fetch img...")
    for(let i=0;i< data.length;i++) {
      await fetchImages(data[i].id).then(res =>{
        if (res.data.length > 0) {
          data[i].img = <img src={MTA_HOME+res.data[0].url}/>
          console.log(data[i].img)
        }else{
          data[i].img = <p>No IMG!</p>
        }
      })
      setRes(data)
      forceUpdate()

      console.log(data)
    }
    console.log("All done!")
  }

  return (
   
    <div className="App">
      <h1>Better MTA-SA Commnity Resrouce Search</h1>
      <input type="text" placeholder="Search term" onChange={(e)=>{
        setSearchTerm(e.target.value)
      }}/>
      <button onClick={()=>{
        setRes([])
        searchResrouces(1)
        }}>Search!</button>
      <p>Total {total}</p>
      <p>HasMore: {more}</p>
      <div className="container">
        <InfiniteScroll  dataLength={total} loader={<h4>Loading...</h4>}
          next={fetchMore}
          hasMore={more == 1 ? true : false}
          endMessage={<p>No More!</p>}
        >
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
          {renderResult()}
          </tbody>
        </table>
        </InfiniteScroll>
       
        <a className="text-center">Dev by Nurupo With ❤ MTA</a>
      </div>
      
      
    </div>
  );
}

export default App;
