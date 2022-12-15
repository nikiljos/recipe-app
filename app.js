let $catList=document.getElementById("cat-list")
let $random = document.getElementById("random");
let $catGrp=document.getElementById("cat-grp");
let $catName = document.getElementById("cat-name");
let $catInput = document.getElementById("cat-input");
let $search = document.getElementById("search-btn");
let $clear = document.getElementById("clear-btn");
let $randomToggle=document.getElementById("random-toggle")
let $modal=document.getElementById("modal")
let $modalContent = document.getElementById("modal-content");
let $modalClose = document.getElementById("modal-close");


let randomCardVisible=true;

loadCategoryList();
loadRandomDish()
// loadCategoryDish("chicken")

$search.onclick=()=>{
    loadCategoryDish($catInput.value)
}

$clear.onclick=()=>{
    $catInput.value=""
}

$modalClose.onclick=()=>{
    $modal.classList.toggle("hide")
}

function loadCategoryList(){
    fetch("https://www.themealdb.com/api/json/v1/1/list.php?c=list")
    .then(res=>{
        return res.json()
    })
    .then(data=>{
        data.meals.forEach((elt) => {
            let $opt=document.createElement("option");
            $opt.value=elt.strCategory
            $catList.append($opt)
        });
    })
}

function loadRandomDish(){
    fetch("https://www.themealdb.com/api/json/v1/1/random.php")
    .then(res=>{
        return res.json()
    })
    .then(data=>{
        console.log(data)
        let $randomCard = renderDishCard({
            id: data.meals[0].idMeal,
            img: data.meals[0].strMealThumb,
            name: data.meals[0].strMeal,
        });
        $randomCard.id="random-card"
        $random.append($randomCard);
    })
}

async function loadCategoryDish(category){
    $catGrp.innerHTML = "";
    window.location.href = "#search";
    toggleRandomCard(true)
    if(category==""||category==undefined){
        $catName.innerText="Please enter a category";
        return
    }
    $catName.innerText=`Showing results for ${category}`
    
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data.meals);
        if(data.meals==null){
            $catName.innerText="Invalid Category!"
            return
        }
        let mealCount=data.meals.length
        data.meals.forEach((elt,i)=>{
            $catGrp.append(renderDishCard({
                id:elt.idMeal,
                img:elt.strMealThumb,
                name:elt.strMeal
            }))
            if(i==mealCount-1){
                window.location.href = "#search";
            }
        })
       
        
        
    })
    .catch(err=>{
        $catName.innerText="Some Error Occured";
    })

    
}


function renderDishCard({id,img,name}){
    let $card=document.createElement("div");
    $card.classList.add("card")
    $card.dataset.meal_id=id
    $card.onclick=initModal
    let $img=document.createElement("img");
    $img.setAttribute("src",img)
    let $name=document.createElement("h2");
    $name.innerText=name;
    $card.append($img,$name);
    return $card
}

$randomToggle.onclick=toggleRandomCard
function toggleRandomCard(hide){
    let currentState = $randomToggle.innerText;
    if(hide===true&&currentState=="Show"){
        return
    }
    if(currentState=="Hide"){
        $randomToggle.innerText = "Show";
    }
    else{
        $randomToggle.innerText = "Hide";
    }
    let $randomCard=document.getElementById("random-card")
    $randomCard.classList.toggle("hide")
}

function toggleModal(){
    $modal.classList.toggle("hide")
}

function initModal(e){
    
    console.log(e.target, e.target.parentNode);
    let id=e.target.dataset.meal_id;
    if(!id){
        id = e.target.parentNode.dataset.meal_id;
    }
    $modalContent.innerHTML = "Loading...";
    toggleModal();
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    .then(res=>res.json())
    .then(data=>{
        let meal=data.meals[0];
        let ingredients=[]
        for(let i=1;i<=20;i++){
            let ing=meal[`strIngredient${i}`]
            if(ing&&ing!=""){
                ingredients.push(ing)
            }
        }
        generateModal({
            status:true,
            ingredients
        })
    })
    .catch(err=>{
        console.log(err)
        generateModal({status:false})
    })

}

function generateModal({status,ingredients}){
    $modalContent.innerHTML = "";
    if(status){
        let $ingList = document.createElement("ul");
        ingredients.forEach((elt) => {
            let $li = document.createElement("li");
            $li.innerText = elt;
            $ingList.append($li);
        });
        $modalContent.append($ingList);
    }
    else{
        $modalContent.innerText = "Error";
    } 
}