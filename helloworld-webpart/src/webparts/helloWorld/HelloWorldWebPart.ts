import { Version, Environment, EnvironmentType } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown,
} from '@microsoft/sp-webpart-base';
import { escape, fromPairs } from '@microsoft/sp-lodash-subset';
import {SPHttpClient, SPHttpClientResponse,ISPHttpClientOptions}from '@microsoft/sp-http';
import styles from './HelloWorldWebPart.module.scss';
import * as strings from 'HelloWorldWebPartStrings';
import {SPComponentLoader}  from '@microsoft/sp-loader'

import * as jQuery from 'jquery';
require('bootstrap');

import{IHelloWorldWebPartProps} from './IHelloWorldWebPartProps';



export default class HelloWorldWebPart extends BaseClientSideWebPart<IHelloWorldWebPartProps> {

  // public constructor(){
  //   super();
  //   SPComponentLoader.loadCss("https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css");

  // }

  public render(): void {
    let cssdata = "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css";
    SPComponentLoader.loadCss(cssdata);
    this.domElement.innerHTML = `
      
          <div class="container" >
            <div id="listdata" class="col-sm-7  " style="background-color: #0000004f;">
              <select id="categories" class="form-control" style="margin-top: 2%;" ></select><br/>
             
                <table id="productable" class="table table-striped">
                  <thead>
                    <tr>
                      <th>products</th>
                    </tr>
                  </thead>
                  <tbody>
                  </tbody>
                </table>
                
            </div><br/><br/><br/><br/><br/><br/><br/>
            <div class="col-sm-7">
                    <form style="margin-top: 2%;">
                      <div class="form-group">
                        <label for="email">Name:</label>
                        <input type="text" class="form-control" id="nametextbox" placeholder="Enter Name" >
                      </div>
                    <div class="form-group">
                        <label for="pwd">Gender:</label>
                       <select class="form-control" id="genderDrop">
                          <option>Male</option>
                          <option>Famale</option>
                       </select>
                      </div>
                      <div class="checkbox">
                        <label><input type="checkbox" name="remember"> Remember me</label>
                      </div>
                      <button type="button" id="saveButton" class="btn btn-default">Save</button>
                  </form>
            </div>
          </div>`;
      this.documentread();
      this.getListsInfo();
      this.getCategory();
    
    //  <div class="${ styles.helloWorld }">
    //  <div class="${ styles.container }">
    //     <div class="${ styles.row }" id="lists" >
    //      <div class="${ styles.column }">
    //        <span class="${ styles.title }">Welcome to SharePoint!</span>
    //        <p class="${ styles.subTitle }">Customize SharePoint experiences using Web Parts.</p>
    //        <p class="${ styles.description }">${escape(this.properties.description)}</p>
    //        <a href="https://aka.ms/spfx" class="${ styles.button }">
    //          <span class="${ styles.label }">Learn more</span>
    //        </a>
    //      </div>
    //    </div>
  }
documentread(){
  var contexts=this.context.pageContext.web.absoluteUrl;
  $(document).ready(function(){
    alert("come"+contexts);
    $('#categories').change(function(){
      alert("come");
      var SelectedItem = $(this);
      alert("SelectedItem" + SelectedItem.val())
      var call = jQuery.ajax({
          url: contexts+"/_api/Web/Lists/getByTitle('Products')/items?$select=Title,ID&$filter=(Category/Title eq '" + SelectedItem.val() + "')",
          type: "GET",
          headers: {
              Accept: "application/json;odata=verbose"
          }
      });
      call.done(function (data, textStatus, jqXHR) {
        alert("came here");
        $("#productable tbody tr").remove();
        var table = $("#productable tbody");
        jQuery.each(data.d.results, function (index, value) {
            table.append("<tr><td>" + value.Title + "</td></tr>");

        });
    });
    call.fail(function (jqXHR, textStatus, errorThrown) {
      alert("Failed");
        var response = JSON.parse(jqXHR.responseText);
        var message = response ? response.error.message.value : textStatus;
        alert("Call failed. Error: " + message);
    });

    })
    $('#saveButton').click(Saveitem);

    function Saveitem()
    {
   //   alert("cames");
    var NAme=document.getElementById('nametextbox')["value"];
   // alert("NAme"+NAme);
    var optionsg=$('#genderDrop').val();
    alert("Gender is : "+optionsg);
    const spOpts: ISPHttpClientOptions = {
      
      body: `{ Title: '${NAme}', Gender: '${optionsg}' }`
    };
    //var gender=optionsg.options[optionsg.selectedIndex].value;
    if (Environment.type === EnvironmentType.Local) {
      this.domElement.querySelector('#listdata').innerHTML = "Sorry this does not work in local workbench";
    } 
    else{
      this.context.spHttpClient.post(
        this.context.pageContext.web.absoluteUrl + `/_api/web/lists/getByTitle('Tasks')/Items`, SPHttpClient.configurations.v1,spOpts)
      .then((response: SPHttpClientResponse) => {
        console.log("After creation response", response);

        response.json().then((responseJSON: JSON) => {
          console.log("JSON", responseJSON);
        });

        if (response.ok) {
          alert("added");
        }
        return;

      })
      .catch((error: SPHttpClientResponse) => {
        console.log(error);
        return;
      });
    }
  }

  });
}

  private getCategory()
  {
    let html: string = '';
    if (Environment.type === EnvironmentType.Local) {
      this.domElement.querySelector('#listdata').innerHTML = "Sorry this does not work in local workbench";
    } else {
    this.context.spHttpClient.get
    (
      this.context.pageContext.web.absoluteUrl + `/_api/web/lists/getByTitle('Category')/Items/?$select=Title`, 
      SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        response.json().then((listsObjects: any) => {
          listsObjects.value.forEach(listObject => {
            html += `
                            <option >${listObject.Title}</option>
                      `;
          });
          this.domElement.querySelector('#categories').innerHTML = html;
        });
      });        
    }
  }

  

    private getListsInfo() {
    let html: string = '';
    if (Environment.type === EnvironmentType.Local) {
      this.domElement.querySelector('#listdata').innerHTML = "Sorry this does not work in local workbench";
    } else {
    this.context.spHttpClient.get
    (
      this.context.pageContext.web.absoluteUrl + `/_api/web/lists?$filter=Hidden eq false`, 
      SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        response.json().then((listsObjects: any) => {
          listsObjects.value.forEach(listObject => {
            html += `
                    <ul>
                        <li>
                            <span class="ms-font-l" style="color:black;">${listObject.Title}</span>
                        </li>
                    </ul>`;
          });
          this.domElement.querySelector('#list').innerHTML = html;
        });
      });        
    }
  } 

  
  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneDropdown('color', {
                  label: 'Dropdown',
                  options: [
                    { key: 'Red', text: 'Red'},
                    { key: 'Blue', text: 'Blue' },
                    { key: 'Green', text: 'Green' },
                  ],
              })
              ]
            }
          ]
        }
      ]
    };
  }
}
