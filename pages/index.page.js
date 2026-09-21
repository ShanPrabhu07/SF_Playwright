const OpenProject=require('./OpenProject.page');
const AddQuestions=require('./AddQuestions.page');

class POManager{

constructor(page){
    this.AddQuestion=new AddQuestions(page);
    this.OpenProject=new OpenProject(page);
}

getAddQuestionsPage(){
    return this.AddQuestion;
}

getHomePage(){
    return this.OpenProject;
}

}

module.exports={POManager};