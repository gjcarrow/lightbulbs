ideaList.deleteIdea(${id})

<a class="edit edit_button" onclick="ideaList.editIdea(event,${id})"><img src="images/edit.png" alt="edit" /></a>
<button class="delete" onclick="ideaList.deleteIdea(${id})"></button>



export default function(text) {
    console.log(`Modules are the baddest ${text}.`);
}