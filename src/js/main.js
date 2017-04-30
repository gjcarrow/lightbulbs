import _ from './utilities.js';
import db from './localDb.js'

const wrapper = _.getById('wrapper');
const searchInputContainer = _.getById('ideaListHeader')
const searchInput = _.getByTag('input',searchInputContainer,true);
const titleInput = _.getById('title_input');
const messageContainer = _.getById('message-container');
const bodyInput = _.getById('body_input');
const valueMessage = _.getClassed('input-error');
const ideasList = _.getById('ideasList');
const saveButton = _.getClassed('save_button');
const log = _.log;

const ideaList = {
  editMode: false,
  state: {
    ideas: []
  },
  init(reloading=false) {
    // Begin. If there are ideas in localStorage, lets grab them and populate the ideas property array.
    let x = db.length();
    let i,key,val;
    if(!reloading) this.assignEvents();
    if(!x) { _.remove(messageContainer,'hide');return; }
    _.add(messageContainer,'hide')
    if(reloading) {
      this.state.ideas = [];
    }
    for (i = 0; i <= x-1; i++) {     
      key = db.key(i);    
      val = db.get(key);
      this.state.ideas.push(val);
    }
    this.state.ideas.sort((a,b)=>{
      if(a['id']<b['id']){
        return -1;
      }else if(a['id']>b['id']) {
        return 1;
      }else{
        return 0;
      }
    })
    // Now lets list them on the page.
    this.listIdeas();
  },
  assignEvents() {
    _.addEvent('click',_.getClassed('save_button'),this.handleNewIdeaSave.bind(this));
    _.addEvent('input',searchInput,this.handleSearchInput.bind(this));      
  },
  handleSearchInput(e) {
    let needle = e.target.value.toLowerCase();
    let needleLength = needle.length;
    let haystack = this.state.ideas;
    let vu;
    if(!needleLength) {
      return;
    }
    vu = haystack.filter((el)=>{
      return ~el.title.toLowerCase().indexOf(needle)
    })
    this.listIdeas(vu);
  },
  clearSearch() {
    if(searchInput.value.length > 0) {
      searchInput.textContent = '';
      searchInput.value = '';
    }
  },
  handleNewIdeaSave(e) {
    this.clearSearch();
    e = e || window.event;
    if(!_.has(valueMessage,'hide')) {
      _.add(valueMessage,'hide')
    }
    if (titleInput.value === '' || !titleInput.value.length) {
      // valueMessage.classList.remove('hide');
      _.remove(valueMessage,'hide')
      return false;
    }
    let myDee = _.generateRandomNumber(),
    objectifiedData = {};

    // Populate the object with values from user
    objectifiedData.title = titleInput.value;
    objectifiedData.quality = 1;
    objectifiedData.id = myDee; /* Get it? Not "EYE DEE" but "MY DEE"*/
    objectifiedData.body = bodyInput.value;


    this.updateStorage(objectifiedData);

    // Reset the input fields
    titleInput.value = ''
    bodyInput.value = ''
    window.focus();
    return;
  },
  listIdeas(filteredState=false) {
    ideasList.innerHTML = '';
    if(filteredState) {
      filteredState.map((idea)=>{
        this.addIdeaToList(idea);
      })
    }else{
    // ideasList is our container, so lets make sure it's empty so we can put our ideas in it.
      this.state.ideas.map((idea)=>{
          this.addIdeaToList(idea)
      })
    }
  },
  addIdeaToList(idea) {
    let val = this.listed_content(idea);
    ideasList.insertAdjacentHTML('afterbegin', val)
  },
  listed_content(oIdea) {
    let {id, title, body, quality } = oIdea;
    return `
    <article class="message" data-id="${id}">
      <div class="message-header">
        <p>${title}</p>
        <a class="edit edit_button" onclick="ideaList.editIdea(event,${id})"><img src="images/edit.png" alt="edit" /></a>
        <button class="delete" onclick="ideaList.deleteIdea(${id})"></button>
      </div>
      <div class="message-body">
        <p>${body}</p>
        <div class="voting-block">
          <span class='vote-comp upvote' onclick="ideaList.handleUpvote(${quality || 1 }, ${id}, 1)"><img src="images/voteIcons/upvote.svg" alt="upvote icon" /></span>
          <span class='vote-comp downvote' onclick="ideaList.handleUpvote(${quality || 1 }, ${id}, 0)"><img src="images/voteIcons/downvote.svg" alt="downvote icon" /></span>
          <p class="vote-comp">&nbsp&nbsp <strong>Quality:</strong>&nbsp ${(quality && quality===3)?"Genius":(quality===2)?"Decent":"Swill"}</p>
        </div>
      </div>
    </article>
    `
  },
  removeFromState(id) {
    let y = this.state.ideas.findIndex((el)=>{
      return el.id == id;
    })
    if(y>=0) {
      if(db.get(id)!==null) {
        db.remove(id);
      }
      this.state.ideas.splice(y, 1)
      this.listIdeas();
    }
  },
  deleteIdea(val) {
    this.clearSearch();
    let x = confirm('This will permenantly delete this idea. Is it really that bad?');
    if(!x) {
      return;
    }
    this.removeFromState(val);
  },
  doneEditing(e) {
    let origId;
    e = e || window.event;
    let charCode = e.keyCode || e.which;
    if(charCode == 13 || charCode == 27) {
      origId = e.target.dataset['ideaid']
      window.removeEventListener('keyup', ideaList.doneEditing);
      ideaList.handleEdit(null, origId, true);
    }
  },
  editIdea(e,val) {
    this.editMode = true;
    // e is the event object, id is id of the idea in storage and state
    // Get a reference to the object that is being edited from local storage ?
    let x = db.get(val);
    let {title, body, quality, id} = x;
    // We need to crawl up the dom until we get to the element with data-id, because that's the container where we control innerHTML
    let parentElement = e.target.parentElement || document.body;
    while (!_.hasAtt(parentElement,'data-id')) {
      parentElement = parentElement.parentElement;
    }
    // Make the content editable with input elements
    parentElement.innerHTML = this.editable_content(x);
    window.addEventListener('keyup', ideaList.doneEditing, false)
  },
  handleEdit(...args) {
    let x;
    let fromKeyPress = args[2] || false;
    this.clearSearch();
    setTimeout(()=>{
      x = document.activeElement.id;
      if(
        (!((x === "edited_body_input") || (x === "edited_title_input"))) || (args[0]===null)){
        this.saveEdits(args[1]);
        this.editMode = false;
      }
    },150)
  },
  saveStorageEvent(id,old,newObj) {
    let oldId = id;

    let objToEditIndex = this.state.ideas.findIndex((idea)=>{
      return idea.id == oldId;
    })


    db.store(oldId,newObj)
    this.state.ideas.splice(objToEditIndex, 1, newObj)
    this.listIdeas();
  },
  saveEdits(origId) {
    if(this.editMode) {
      let objToEditIndex = this.state.ideas.findIndex((idea)=>{
        return idea.id == origId;
      })
      let objToEdit = this.state.ideas[objToEditIndex];
      let editedIdea = {
        body: _.getById('edited_body_input').value,
        quality: objToEdit.quality,
        title: _.getById('edited_title_input').value,
        id: objToEdit.id
      }
      db.store(editedIdea.id,editedIdea)
      this.state.ideas.splice(objToEditIndex, 1, editedIdea)
      this.editMode = false;
      this.listIdeas()
    }
  },
  // Handle User Voting Up or Down their idea. Type is either 1 for 'up' or 0 for 'down'
  handleUpvote(currQuality, id, type) {
    let x = this.state.ideas.find((idea)=>{
      return idea.id===id
    });
    if(type) {
      x.quality = currQuality===3||currQuality===2?3:2;
    }else{
      x.quality = currQuality===1||currQuality===2?1:2;
    }
    db.store(id, x);
    this.listIdeas();
  },
  editable_content(theRest) {

      let { id, title, body } = theRest;

      // wrapper.insertAdjacentHTML('afterbegin',
      return `
        <div class="message-header">
          <div style="display:none;" class="field field_hidden">
            <p class="control">
              <input id="edited_id_input" class="input" type="number" value=${id} hidden />
            </p>
          </div>
        </div>
        <div class="message-body">
          <div class="field">
            <p class="control">
              <input id="edited_title_input" class="input" type="text" data-ideaId="${id}" onblur="ideaList.handleEdit(event, ${id})" value="${ title }" />
            </p>
          </div>
          <div class="field">
            <p class="control">
              <input id="edited_body_input" data-ideaId="${id}" class="input" type="text" onblur="ideaList.handleEdit(event, ${id})" value="${body}" />
            </p>
          </div>
        </div>
        `
    },
  updateStorage( idea ) {
    let storedObject = JSON.stringify(idea);
    let storedKey = idea.id;
    if(db.get(storedKey)===null) {
      db.store(storedKey, storedObject);
    }
    this.handleNewIdea(idea);
  },
  handleNewIdea(idea) {
    this.state.ideas.push(idea);
    // this.addIdeaToList(idea);
    this.listIdeas();
  }
  }

  window.addEventListener('storage', function(e) {  
    setTimeout(ideaList.init(true),1000)
  });

_.domReady(()=>{
  window.ideaList = ideaList;
  ideaList.init();
})