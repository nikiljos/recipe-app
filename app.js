let $catList=document.getElementById("cat-list")
let $random = document.getElementById("random");
let $catGrp=document.getElementById("cat-grp");
let $catName = document.getElementById("cat-name");
let $catInput = document.getElementById("cat-input");
let $search = document.getElementById("search-btn");
let $clear = document.getElementById("clear-btn");
let $randomToggle=document.getElementById("random-toggle-outer")
let $randomToggleText = document.getElementById("random-toggle");
let $toggleImg = document.getElementById("toggle-img");
let $modal=document.getElementById("modal")
let $modalContent = document.getElementById("modal-content");
let $modalIng = document.getElementById("modal-ing");
let $modalClose = document.getElementById("modal-close");
let $modalStatus = document.getElementById("modal-status");


let randomCardVisible=true;
let rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

loadCategoryList();
loadRandomDish()

$search.onclick=()=>{
    loadCategoryDish($catInput.value)
}

$clear.onclick=()=>{
    $catInput.value=""
}

$modalClose.onclick=()=>{
    $modal.classList.toggle("hide")
}

// fetch list of categories and add to datalist 
function loadCategoryList(){
    fetch("https://www.themealdb.com/api/json/v1/1/list.php?c=list")
    .then(res=>{
        return res.json()
    })
    .then(data=>{
        $catInput.setAttribute("placeholder","Search by Category")
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
        let $randomCard = renderDishCard({
            id: data.meals[0].idMeal,
            img: data.meals[0].strMealThumb,
            name: data.meals[0].strMeal,
        });
        $randomCard.id="random-card"
        $random.append($randomCard);
    })
    .catch(err=>{
        alert("Sorry, Some error Occured in fetching random meal...")
    })
}

// load dishes based on category searched
function loadCategoryDish(category){
    $catGrp.innerHTML = "<h2>Loading...</h2>";
    $catName.innerText = "";
    window.location.href = "#search";
    toggleRandomCard(true)
    if(category==""||category==undefined){
        $catGrp.innerHTML="";
        $catGrp.innerHTML = "<h2>Please enter a category...</h2>";
        return
    }
    
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
    .then(res=>res.json())
    .then(data=>{
        $catGrp.innerHTML = "";
        if(data.meals==null){
            $catGrp.innerHTML="<h2>Invalid Category!</h2>"
            return
        }
        $catName.innerText = `Showing results for ${category}`;
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
        $catGrp.innerHTML = "";
        $catGrp.innerHTML = "<h2>Sorry, Some error occured!</h2>";
    })

    
}

// return dish card used inside search results
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

//returns ingredient cards used inside modal
function renderIngCard({img,name}){
    let $card=document.createElement("div");
    $card.classList.add("ing");
    let $img=document.createElement("img");
    let $name=document.createElement("div")
    $img.setAttribute("src",img);
    $name.innerText=name;
    $card.append($img,$name);
    return $card
}

// random card show/hide
$randomToggle.onclick=toggleRandomCard
function toggleRandomCard(hide){
    let currentState = $randomToggleText.innerText;
    if(hide===true&&currentState=="Show"){
        return
    }
    let newState="Hide"
    if(currentState=="Hide"){
        newState="Show"
    }
    $randomToggleText.innerText = newState;
    $toggleImg.setAttribute("src", `assets/icons/${newState.toLowerCase()}.png`);
    let $randomCard=document.getElementById("random-card")
    $randomCard.classList.toggle("hide")
}

function toggleModal(){
    $modal.classList.toggle("hide")
}

// call details api, pass data to render functions and control visibility
function initModal(e){
    $modalStatus.innerHTML = "Loading...";
    $modalStatus.style.display=""
    $modalContent.style.display = "none";
    let id=e.target.dataset.meal_id;
    if(!id){
        id = e.target.parentNode.dataset.meal_id;
    }
    toggleModal();
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    .then(res=>res.json())
    .then(data=>{
        let meal=data.meals[0];
        let ingredients=[]
        let detail = {
            name: meal.strMeal,
            img: meal.strMealThumb,
            ytURL: meal.strYoutube,
            webURL: meal.strSource,
        };
        for(let i=1;i<=20;i++){
            let ing=meal[`strIngredient${i}`]
            if(ing&&ing!=""){
                ingredients.push(ing)
            }
        }

        updateModal({
            status:true,
            ingredients,
            detail
        })
    })
    .catch(err=>{
        updateModal({status:false})
    })

}

//adds ingredient cards to maodal and calls detail render function
function updateModal({status,ingredients,detail}){
    $modalIng.innerHTML = "";
    if(status){
        updateModalDetail(detail)
        // let $ingList = document.createElement("div");
        ingredients.forEach((elt) => {
            let $ingCard = renderIngCard({
                name: elt,
                img: `https://www.themealdb.com/images/ingredients/${elt}.png`,
            });
            $modalIng.append($ingCard);
        });
        // $modalIng.append($ingList);
        $modalStatus.style.display = "none";
        $modalContent.style.display = "";
        $modalIng.scroll({
            top: 0,
        });
    }
    else{
        $modalStatus.innerText = "Sorry, Some error occured 🥲";
    } 
}

//renders dish detail and cta buttons in modal
function updateModalDetail({img,name,ytURL,webURL}){
    let $dishImg=document.getElementById("dish-img")
    let $recipeCta = document.getElementById("recipe-cta");
    let $dishName = document.getElementById("dish-name");
    let $ytURL = document.getElementById("yt-btn");
    let $webURL = document.getElementById("web-btn");
    $dishImg.setAttribute("src",img)
    $dishName.classList.remove("small");
    $recipeCta.classList.remove("small");
    $dishName.innerText=name
    let ytAvailable=(ytURL !== null && ytURL !== "")
    let webAvailable=(webURL!==null && webURL!=="")
    setTimeout(()=>{
        let textHeight = $dishName.offsetHeight;
        
        if ((textHeight > rem * 2 + 20)&&ytAvailable&&webAvailable) {
            $dishName.classList.add("small");
            $recipeCta.classList.add("small");
        }
    },100)
    $ytURL.style.display="none";
    $webURL.style.display = "none";
    if (ytAvailable) {
        $ytURL.setAttribute("href", ytURL);
        $ytURL.style.display = "";
    }
    if(webAvailable){
        let externalDomain = webURL.split("/")[2];
        $webURL.setAttribute("href", webURL);
        $webURL.setAttribute("title", `Redirects to ${externalDomain}`);
        $webURL.style.display = "";
    }  
}