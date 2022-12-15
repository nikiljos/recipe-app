let $catList=document.getElementById("cat-list")
let $random = document.getElementById("random");
let $catGrp=document.getElementById("cat-grp");
let $catName = document.getElementById("cat-name");
let $catInput = document.getElementById("cat-input");
let $search = document.getElementById("search-btn");
let $clear = document.getElementById("clear-btn");
let $randomToggle=document.getElementById("random-toggle")
let $toggleImg = document.getElementById("toggle-img");
let $modal=document.getElementById("modal")
let $modalContent = document.getElementById("modal-content");
let $modalIng = document.getElementById("modal-ing");
let $modalClose = document.getElementById("modal-close");
let $modalStatus = document.getElementById("modal-status");


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
        // console.log(data)
        let $randomCard = renderDishCard({
            id: data.meals[0].idMeal,
            img: data.meals[0].strMealThumb,
            name: data.meals[0].strMeal,
        });
        $randomCard.id="random-card"
        $random.append($randomCard);
    })
}

function loadCategoryDish(category){
    $catGrp.innerHTML = "Loading...";
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
        $catGrp.innerHTML = "";
        // console.log(data.meals);
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
        $catGrp.innerHTML = "";
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
    // else if(hide===false&&currentState=="Hide"){
    //     return
    // }
    let newState="Hide"
    if(currentState=="Hide"){
        newState="Show"
    }
    $randomToggle.innerText = newState;
    $toggleImg.setAttribute("src", `assets/icons/${newState.toLowerCase()}.png`);
    let $randomCard=document.getElementById("random-card")
    $randomCard.classList.toggle("hide")
}

function toggleModal(){
    $modal.classList.toggle("hide")
}

function initModal(e){
    
    // console.log(e.target, e.target.parentNode);
    $modalStatus.innerHTML = "Loading...";
    $modalStatus.style.display=""
    $modalContent.style.display = "none";
    let id=e.target.dataset.meal_id;
    if(!id){
        id = e.target.parentNode.dataset.meal_id;
    }
    // $modalIng.innerHTML = "Loading...";
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
        console.log(err)
        updateModal({status:false})
    })

}

function updateModal({status,ingredients,detail}){
    $modalIng.innerHTML = "";
    if(status){
        updateModalDetail(detail)
        let $ingList = document.createElement("ul");
        ingredients.forEach((elt) => {
            let $li = document.createElement("li");
            $li.innerText = elt;
            $ingList.append($li);
        });
        // $recipeLink=document.createElement("a");
        // $recipeLink.setAttribute("href","/recipe?id=123")
        // $recipeLink.innerText="Recipe"
        $modalIng.append($ingList);
        $modalStatus.style.display = "none";
        $modalContent.style.display = "";
    }
    else{
        $modalStatus.innerText = "Sorry, Some error occured 🥲";
    } 
}

function updateModalDetail({img,name,ytURL,webURL}){
    let $dishImg=document.getElementById("dish-img")
    $dishImg.setAttribute("src",img)
    let $dishName = document.getElementById("dish-name");
    $dishName.innerText=name
    let $ytURL = document.getElementById("yt-btn");
    let $webURL = document.getElementById("web-btn");
    $ytURL.style.display="none";
    $webURL.style.display = "none";
    if (ytURL !== null && ytURL !== "") {
        $ytURL.setAttribute("href", ytURL);
        $ytURL.style.display = "";
    }
    if(webURL!==null && webURL!==""){
        let externalDomain = webURL.split("/")[2];
        $webURL.setAttribute("href", webURL);
        $webURL.setAttribute("title", `Redirects to ${externalDomain}`);
        $webURL.style.display = "";
    }  
}