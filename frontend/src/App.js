import './App.css';
import axios from 'axios'
import React, { useState,useReducer } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import InfiniteScroll from 'react-infinite-scroll-component';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css'; // This only needs to be imported once in your app

const MTA_HOME = "https://community.multitheftauto.com/"
function App() {
  
  let [total, setTotal] = useState(0);
  let [resources, setRes] = useState([]);
  let [searchTerm, setSearchTerm] = useState("");
  let [ignored, forceUpdate] = useReducer(x => x + 1, 0);
  let [more, setHasMore] = useState(0);
  let [loadedPage, setLoadedPage] = useState(1);


  
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
    console.log("Fetch more requested")
    if (loadedPage < calcMaxPage(total)) {
      setTimeout(() => {
        setLoadedPage(loadedPage+1)
        searchResrouces(loadedPage+1)
        console.log("Fetching More request")
      }, 500);

      
    }

  }
  async function fetchImages(res_id) {
    return axios.get(`http://127.0.0.1:5000/gallery?id=${res_id}`)
  }
  async function searchResrouces(page = 1){

    
    let data = [...resources]
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
          img: "Loading"
        })
        fetchImages(e.data.data[i].id).then(res=>{
          if (res.data.length > 0) {
            data[i].img = <img src={MTA_HOME+res.data[0].url}/>
            console.log(data[i].img)
            console.log(data)
          }else{
            data[i].img = <p>No IMG!</p>
          }
        })
      }
      setRes(data)
      setTotal(e.data.total)
      setHasMore(loadedPage <= calcMaxPage(e.data.total) ? 1 : 0)
      console.log(`Set has more = ${loadedPage <= calcMaxPage(e.data.total)}`)

    })
    
    
    /*
    console.log("Resrouce fetched, try to fetch img...")
    for(let i=loadedPage *20;i< resources.length;i++) {
      await fetchImages(data[i].id).then(res =>{
        if (res.data.length > 0) {
          data[i].img = <img src={MTA_HOME+res.data[0].url}/>
          console.log(data[i].img)
          setRes(data)
          console.log(data)
         
        }else{
          data[i].img = <p>No IMG!</p>
        }
      })
      
    }
    */
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
        setLoadedPage(1)
        searchResrouces(1)
        }}>Search!</button>
      <p>Total {total} resources.</p>
      <p>Loaded {resources.length} resources.</p>
      <div className="container">
        <InfiniteScroll  dataLength={resources.length} loader={<h4>Loading...</h4>}
          next={()=>{fetchMore()}}
          hasMore={more === 1 ? true : false}
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
