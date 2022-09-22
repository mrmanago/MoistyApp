let realbutton = document.getElementById('realbutton')
const custombutton = document.getElementById('custombutton')
const customtext = document.getElementById('customtext')
const input = document.querySelector('input[type="file"]')
const choice_zeros_field = document.querySelector('#zero_yes_or_no');
const keep_filtering_field = document.querySelector('#keep_filtering');

let choice_zeros = false;
const input_email_field = document.querySelector('#input_text');
const refresh_btn_field = document.querySelector('#refresh_btn');
let output_field = document.getElementById('output');
let output_text_field = document.getElementById("output_text")
let text_variable_name_specific_js = document.getElementById('text_variable_name_specific');

let displayed_advanced_output = false;
let displayed_graph = false;
let entered_something_in_input_collector = false;
let pi_chart_exists = false;
let ran_succesfully_advanced_selection = false;
let keep_filtering_boolean = false;

const advanced_input_variable_field = document.querySelector('#all_variable_list');
const advanced_equation_variable_field = document.querySelector('#equation_text');
const advanced_number_variable_field = document.querySelector('#number_input');
const run_button = document.getElementById("buttonrun")

//these functions are to pretend that the realbutton is clicked
custombutton.addEventListener('click', function () {
  realbutton.click();
})





const margin = { top: 10, right: 30, bottom: 30, left: 40 },
  width = 400 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

let svg = d3.select("#graph_1")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

realbutton.addEventListener('change', function (e) {
  if (realbutton.value) {
    customtext.innerHTML = realbutton.value.match(/[\/\\]([\w\d\s\.\-\(\)]+)$/)[1];
    Papa.parse(realbutton.files[0], {
      download: true,
      header: true,
      complete: function (results) {
        //example what you can do with this data
        //example 1: select columns
        let mydata = results.data.slice(0);
        sentiment_and_date = mydata.map(element => ({ "sentiment": element.sentiment, "date": element.date }))
        console.log("example: only sentiment and date:", sentiment_and_date);

        //example 2: select specific elements
        console.log(mydata[1].toId);

        //example 3 print out unique values (in this case FromId)
        let outputList = [];
        for (let fromId in mydata) {
          outputList.push({ id: fromId });
        }
        node = JSON.stringify(outputList, null, 4);


        //end of examples. Renaming:
        mydata.forEach(key => [renameKey(key, 'fromId', 'outgoing_edge'), renameKey(key, 'toId', 'incomming_edge'), renameKey(key, 'fromEmail', 'Id_node')]);
        let renamed_mydata = JSON.stringify(mydata);
        console.log(JSON.parse(renamed_mydata));
        mydata = JSON.parse(renamed_mydata);

        //force integer values where possible
        for (var i = 0; i < mydata.length; i++) {
          var object = mydata[i];
          for (var property in object) {
            if (object.hasOwnProperty(property) && object[property] !== null && !isNaN(object[property])) {
              object[property] = +object[property];
            }
          }
        }

        //for some reason the last column is undefined thus this one gets deleted:
        mydata = mydata.slice(1, (Object.keys(mydata).length) - 1);

        //group on 'Id_node':
        var groupBy = function (data, key) {
          return data.reduce(function (rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
          }, {});
        };
        grouped_data = JSON.stringify(groupBy(mydata, 'Id_node'));
        grouped_data = JSON.parse(grouped_data);



        //bar chart
        //  const xScale = d3.scaleBand().domain(mydata.map((dataPoint)=> dataPoint.Id_node)).rangeRound([0, 1000]).padding(0.1);
        //      const yScale = d3.scaleLinear().domain([0, 1000]).range([1000,0]);


        //      const container=d3.select('#graph_1')
        //                        .classed('class_graph1', true);
        //        const bars= container
        //          .selectAll('.bars')
        //          .data(mydata)
        //          .enter()
        //          .append('rect')
        //          .classed('bars', true)
        //          .attr('width', xScale.bandwidth())
        //          .attr('height', (mydata) => 1000 - yScale(mydata.incomming_edge))
        //          .attr('x', data=> xScale(data.Id_node))
        //          .attr('y', data=> xScale(data.incomming_edge));


        //node-link diagram
        let links = mydata.map(element => ({ "source": element.outgoing_edge, "target": element.incomming_edge }))

        nodes_2 = _.keys(_.countBy(mydata, function (mydata) { return mydata.outgoing_edge; }));
        let nodes = nodes_2.map(element => ({ "id": element }))

        for (var i = 0; i < nodes.length; i++) {
          var object = nodes[i];
          for (var property in object) {
            if (object.hasOwnProperty(property) && object[property] !== null && !isNaN(object[property])) {
              object[property] = +object[property];
            }
          }
        }
        console.log('test ' + JSON.stringify(nodes));
        let node_link_data = { "nodes": nodes, "links": links };
        console.log('final dataset= ' + JSON.stringify(node_link_data));


        //statistics
        let emails_array = [];
        for (const prop in grouped_data) {
          emails_array.push(prop);
        }

        emails_array.forEach((element, index) => {
          let new_option = document.createElement("option");
          new_option.value = element;
          document.getElementById("email_ids").appendChild(new_option);
        });

        choice_zeros_field.addEventListener('change', function (e) {
          if (displayed_graph == true) { //check if graph exists; if so, destroy it
            graph_sentiment_date_1.destroy();
            graph_date_amount_1.destroy();
            displayed_graph = false;
            if (pi_chart_exists == true) {
              pi_chart_to.destroy();
              pi_chart_from.destroy();
              job_title_sentiment.destroy();
              pi_chart_exists = false;
            }
          }
          output_field.innerHTML = '';    //destroy output
          if (choice_zeros_field.checked) {
            choice_zeros = true;
            if (input_email_field.value == "" && displayed_advanced_output == true) {
              statistics_updated(filtered_data, choice_zeros)
            } else if (input_email_field.value !== "" && displayed_advanced_output == false) {
              let input_of_text_is = input_email_field.value
              let all_of_input = Object.keys(grouped_data);
              let in_or_not = all_of_input.includes(input_of_text_is);
              statistics(choice_zeros, in_or_not, input_of_text_is)
            }
          } else if (choice_zeros_field.checked == false) {
            choice_zeros = false;
            if (input_email_field.value == "" && displayed_advanced_output == true) {
              statistics_updated(filtered_data, choice_zeros)
            } else if (input_email_field.value !== "" && displayed_advanced_output == false) {
              let input_of_text_is = input_email_field.value
              let all_of_input = Object.keys(grouped_data);
              let in_or_not = all_of_input.includes(input_of_text_is);
              statistics(choice_zeros, in_or_not, input_of_text_is)
            }
          }
        });

        input_email_field.addEventListener('change', function (e) {
          let input_of_text_is = input_email_field.value
          let in_or_not = emails_array.includes(input_of_text_is);
          if (in_or_not == true) {
            if (displayed_graph == true) { //check if graph exists; if so, destroy it
              graph_sentiment_date_1.destroy();
              graph_date_amount_1.destroy();
              displayed_graph = false;
              displayed_advanced_output = false;
              if (pi_chart_exists == true) {
                pi_chart_to.destroy();
                job_title_sentiment.destroy();
                pi_chart_from.destroy();
                pi_chart_exists = false;
              }
            }
            grouped_data = groupBy(mydata, 'Id_node');
            output_field.innerHTML = '';
            statistics(choice_zeros, in_or_not, input_of_text_is)
          }
        });

        //nice selecting tool -> advanced input selector
        let all_variables_array = [];
        for (const prop in mydata[1]) {
          all_variables_array.push(prop);
        }
        all_variables_array.forEach((element, index) => {
          new_option = document.createElement("option");
          new_option.value = element;
          document.getElementById("all_variables").appendChild(new_option);
        });


        let text_advanced_input_js = document.createElement('p');
        text_variable_name_specific_js.appendChild(text_advanced_input_js);
        text_advanced_input_js.id = "advanced_input_variable_chosen"
        let input_variable_advanced_present = false;
        let equation_variable_advanced_present = false;
        let input_number_advanced_present = false;



        advanced_input_variable_field.addEventListener('change', function (e) {
          let input_variable_advanced = advanced_input_variable_field.value
          input_variable_advanced_present = true;
          entered_something_in_input_collector = true;
          text_advanced_input_js.innerHTML = input_variable_advanced;

          if (input_variable_advanced_present && equation_variable_advanced_present && input_number_advanced_present) {
            document.getElementById("buttonrun").style.display = "block";
          } else {
          }

        });

        advanced_equation_variable_field.addEventListener('change', function (e) {
          let equation_variable_advanced = advanced_equation_variable_field.value
          equation_variable_advanced_present = true;
          entered_something_in_input_collector = true;

          if (input_variable_advanced_present && equation_variable_advanced_present && input_number_advanced_present) {
            document.getElementById("buttonrun").style.display = "block";
          } else {
          }

        });

        advanced_number_variable_field.addEventListener('change', function (e) {
          let input_number_advanced = advanced_number_variable_field.value
          input_number_advanced_present = true;
          entered_something_in_input_collector = true;
          console.log(input_number_advanced)

          if (input_variable_advanced_present && equation_variable_advanced_present && input_number_advanced_present) {
            document.getElementById("buttonrun").style.display = "block";
          } else {

          }

          //    text_advanced_input_js.innerHTML = input_variable_advanced;
          //    let grouped_data_on_specific_variable= groupBy(mydata, input_variable_advanced);
          //    let all_possible_values_advanced = Object.keys(grouped_data_on_specific_variable);
        });

        run_button.addEventListener('click', function (e, input_variable_advanced) {
          document.getElementById("buttonrun").style.display = "none";
          console.log(displayed_graph)
          if (displayed_graph == true) {
            graph_sentiment_date_1.destroy();
            graph_date_amount_1.destroy();
            output_field.innerHTML = '';
            input_email_field.value = '';
            displayed_graph = false;
            displayed_advanced_output = false;
            if (pi_chart_exists == true) {
              pi_chart_to.destroy();
              pi_chart_from.destroy();
              job_title_sentiment.destroy();
              pi_chart_exists = false;
            }
          }
          input_number_advanced_present = false;
          input_variable_advanced_present = false;
          equation_variable_advanced_present = false;
          input_variable_advanced = advanced_input_variable_field.value
          equation_variable_advanced = advanced_equation_variable_field.value
          input_number_advanced = advanced_number_variable_field.value
          let false_input = false;
          let false_input_variable = false;
          let wrong_equation = false;

          let input_variable_advanced_check = all_variables_array.includes(input_variable_advanced);

          if (input_variable_advanced_check == false) {
            alert('please enter correct variable, for example: ' + all_variables_array[2] + " or " + all_variables_array[4])
            false_input_variable = true;
          }

          if (false_input_variable == false) {

            if (equation_variable_advanced == 'greater than') {
              equation_variable_advanced = '>'
            } else if (equation_variable_advanced == 'equal to') {
              equation_variable_advanced = '=='
            } else if (equation_variable_advanced == 'smaller than') {
              equation_variable_advanced = '<'
            } else {
              alert("Wrong equation; possible equations are 'large than', 'equal to' or 'smaller than'.")
              wrong_equation = true;
            }

            if (wrong_equation == false) {



              let grouped_data_on_specific_variable = groupBy(mydata, input_variable_advanced);
              let all_possible_values_advanced = Object.keys(grouped_data_on_specific_variable);
              let in_all_available_data = all_possible_values_advanced.includes(input_number_advanced);
              console.log(all_possible_values_advanced);
              console.log(in_all_available_data);

              //check input:

              if (input_variable_advanced == "date") {
                function isValidDate(dateString) {
                  var regEx = /^\d{4}-\d{2}-\d{2}$/;
                  if (!dateString.match(regEx)) return false;
                  var d = new Date(dateString);
                  var dNum = d.getTime();
                  if (!dNum && dNum !== 0) return false;
                  return d.toISOString().slice(0, 10) === dateString;
                }
                let valid_or_not = isValidDate(input_number_advanced);
                if (valid_or_not == false) {
                  alert("please enter a valid date, in the format yyyy-mm-dd")
                  false_input = true;
                }
              } else if (input_variable_advanced == "sentiment") {
                if (input_number_advanced > 1 || input_number_advanced < -1) {
                  alert("Sentiment has a range between -1 and 1. Values below -1 or above 1 are not allowed.")
                  false_input = true;
                }
              } else if (input_variable_advanced == "outgoing_edge") {
                if (input_number_advanced < 1 || input_number_advanced > all_possible_values_advanced.length) {
                  alert("outgoing_edge has a range between 1 and " + all_possible_values_advanced.length)
                }

              } else if (input_variable_advanced == "incomming_edge") {
                if (input_number_advanced < 1 || input_number_advanced > all_possible_values_advanced.length) {
                  alert("incomming_edge has a range between 1 and " + all_possible_values_advanced.length)
                }

              } else {
                if (in_all_available_data == false) {
                  alert("please enter a valid value for " + input_variable_advanced + " for example: " + all_possible_values_advanced[1] + " or " + all_possible_values_advanced[0])
                  false_input = true;
                }
              }

              if (false_input == false) {
                let if_statement_selection = String(input_variable_advanced + equation_variable_advanced + input_number_advanced)
                console.log(if_statement_selection);
                if (keep_filtering_boolean == false) {
                  grouped_data = groupBy(mydata, input_variable_advanced);
                  advanced_statistics(grouped_data, mydata, input_variable_advanced, equation_variable_advanced, input_number_advanced, if_statement_selection, choice_zeros)
                  if (filtered_data.length == 0) {
                    document.getElementById("keep_filtering").style.display = "none";
                    document.getElementById("keep_filtering_lable").style.display = "none";
                    document.getElementById("keep_filtering").checked = false
                    keep_filtering_boolean = false;
                    alert('Selection resulted in no available data.')
                  } else {
                    statistics_updated(filtered_data, choice_zeros)
                    ran_succesfully_advanced_selection = true;
                    document.getElementById("keep_filtering").style.display = "block";
                    document.getElementById("keep_filtering_lable").style.display = "block";
                    document.getElementById("keep_filtering").checked = false
                  }
                } else if (keep_filtering_boolean == true) {
                  grouped_data = groupBy(filtered_data, input_variable_advanced);
                  advanced_statistics(grouped_data, filtered_data, input_variable_advanced, equation_variable_advanced, input_number_advanced, if_statement_selection, choice_zeros)
                  if (filtered_data.length == 0) {
                    alert('Selection resulted in no available data.')
                    document.getElementById("keep_filtering").style.display = "none";
                    document.getElementById("keep_filtering_lable").style.display = "none";
                    document.getElementById("keep_filtering").checked = false
                    keep_filtering_boolean = false;
                  } else {
                    statistics_updated(filtered_data, choice_zeros)
                    ran_succesfully_advanced_selection = true;
                    document.getElementById("keep_filtering").style.display = "block";
                    document.getElementById("keep_filtering_lable").style.display = "block";
                    document.getElementById("keep_filtering").checked = false
                  }
                }

              }


            }

          }
          advanced_number_variable_field.value = '';
          advanced_equation_variable_field.value = '';
          advanced_input_variable_field.value = '';
          text_advanced_input_js.innerHTML = '';





        });

        keep_filtering_field.addEventListener('change', function (e) {
          if (keep_filtering_field.checked) {
            keep_filtering_boolean = true;
          } else if (choice_zeros_field.checked == false) {
            keep_filtering_boolean = false;
          }
        });








        //  let all_of_input = Object.keys(grouped_data);
        //  let in_or_not = all_of_input.includes(input_of_text_is);






        function statistics(choice_zeros, in_or_not, input_specific) {
          document.getElementById("keep_filtering").style.display = "none";
          document.getElementById("keep_filtering_lable").style.display = "none";
          keep_filtering_boolean = false;
          if (in_or_not == false) {
            alert('email not in dataset')
          } else if (in_or_not == true) {
            let required_data = grouped_data[input_specific];
            console.log(grouped_data)
            let all_datapoints = Object.keys(required_data);

            let sentiment_array = [];
            all_datapoints.forEach(element => sentiment_array.push(required_data[element].sentiment));

            if (choice_zeros == false) {
              //mean sentiment without zero's
              let sum_sentiment = sentiment_array.reduce((a, b) => a + b, 0);
              let mean_sentiment = sum_sentiment / (sentiment_array.length);
              console.log('mean sentiment is: ' + mean_sentiment);

              //get comunicating partners in array
              let communicating_partners = [];
              let communicating_partners_date = [];
              let communicating_partners_jobtitle = [];
              for (i = 0; i < all_datapoints.length; i++) {
                communicating_partners.push(required_data[i].toEmail);
                communicating_partners_date.push(required_data[i].date);
                communicating_partners_jobtitle.push(required_data[i].toJobtitle);
              };


              //    let communicating_partners = [];
              //    all_datapoints.forEach(element => communicating_partners.push(required_data[element].toEmail));

              //mode partner + sentiment to partner
              let maximum_partner = 0;
              let mode_partners;
              let frequency = {};
              for (var v in communicating_partners) {
                frequency[communicating_partners[v]] = (frequency[communicating_partners[v]] || 0) + 1;
                if (frequency[communicating_partners[v]] > maximum_partner) {
                  maximum_partner = frequency[communicating_partners[v]];
                  mode_partners = communicating_partners[v];
                }
              }
              console.log('most emails send to: ' + mode_partners + ' in total ' + maximum_partner);
              const emails_to_partner = required_data.filter(function (entry) {
                return entry.toEmail === mode_partners;
              });

              emails_to_partner_array = [];
              let sum = 0;
              for (i = 0; i < maximum_partner; i++) {
                sum = sum + emails_to_partner[i].sentiment
              }
              mean_sentiment_partner = sum / maximum_partner;
              console.log('with an average sentiment to this person of ' + mean_sentiment_partner);

              //mode date + sentiment on date
              let maximum_date = 0;
              let mode_date;
              frequency = {};
              for (var v in communicating_partners_date) {
                frequency[communicating_partners_date[v]] = (frequency[communicating_partners_date[v]] || 0) + 1;
                if (frequency[communicating_partners_date[v]] > maximum_date) {
                  maximum_date = frequency[communicating_partners_date[v]];
                  mode_date = communicating_partners_date[v];
                }
              }
              console.log('most emails send on ' + mode_date + ', namely: ' + maximum_date + ' emails')


              sum = 0;
              for (i = 0; i < all_datapoints.length; i++) {
                if (required_data[i].date === mode_date) {
                  sum = sum + required_data[i].sentiment
                };
              };
              let mean_sentiment_date = sum / maximum_date
              console.log('sentiment on this day was ' + mean_sentiment_date);

              //mode jobtitle + sentiment towards this jobtitle
              let maximum_jobtitle = 0;
              let mode_jobtitle;
              frequency = {};
              for (var v in communicating_partners_jobtitle) {
                frequency[communicating_partners_jobtitle[v]] = (frequency[communicating_partners_jobtitle[v]] || 0) + 1;
                if (frequency[communicating_partners_jobtitle[v]] > maximum_jobtitle) {
                  maximum_jobtitle = frequency[communicating_partners_jobtitle[v]];
                  mode_jobtitle = communicating_partners_jobtitle[v];
                }
              }
              console.log('most emails send towards ' + mode_jobtitle + ', namely: ' + maximum_jobtitle + ' emails')


              sum = 0;
              for (i = 0; i < all_datapoints.length; i++) {
                if (required_data[i].toJobtitle === mode_jobtitle) {
                  sum = sum + required_data[i].sentiment;
                };
              };
              let mean_sentiment_jobtitle = sum / maximum_jobtitle;
              console.log('sentiment towards people with this job is ' + mean_sentiment_jobtitle);

              //output:
              if (mean_sentiment >= 0) {
                let happy_face = new Image();

                happy_face.onload = function () {
                  output_field.appendChild(happy_face);
                };
                happy_face.id = "face"

                happy_face.src = 'inputgallery/happy_face.png'
              } else if (mean_sentiment == 0) {
                let neutral_face = new Image();

                neutral_face.onload = function () {
                  output_field.appendChild(neutral_face);
                };
                neutral_face.id = "face"

                neutral_face.src = 'inputgallery/neutral_face.png'

              } else if (mean_sentiment < 0) {
                let sad_face = new Image();

                sad_face.onload = function () {
                  output_field.appendChild(sad_face);
                };

                sad_face.id = "face"

                sad_face.src = 'inputgallery/sad_face.png'
              }

              let text_content_container = document.createElement('p');
              let text_content = document.createTextNode("Mean sentiment: " + mean_sentiment);
              text_content_container.appendChild(text_content);
              text_content_container.id = "text_mean_sentiment"
              output_field.appendChild(text_content_container);

              let partner_image = new Image();
              partner_image.onload = function () {
                output_field.appendChild(partner_image);
              };
              partner_image.id = "partner_imgage_css"
              partner_image.src = 'inputgallery/partners.jpg'

              let text_content_container_2 = document.createElement('p');
              text_content_container_2.innerHTML = "Best partners with: " + mode_partners +
                "<br />" + "In total: " + maximum_partner +
                " emails send to him/her" + "<br />" + "With an average sentiment of " +
                mean_sentiment_partner;
              output_field.appendChild(text_content_container_2);
              text_content_container_2.id = "partners_text"

              if (mode_jobtitle === "Trader") {
                let trader_img = new Image();
                trader_img.onload = function () {
                  output_field.appendChild(trader_img);
                };
                trader_img.id = "profession";
                trader_img.src = 'inputgallery/trader.png';
              } else if (mode_jobtitle === "Unknown") {
                let unknown_img = new Image();
                unknown_img.onload = function () {
                  output_field.appendChild(unknown_img);
                };
                unknown_img.id = "profession";
                unknown_img.src = 'inputgallery/unknown.jpg';
              } else if (mode_jobtitle === "Employee") {
                let employee_img = new Image();
                employee_img.onload = function () {
                  output_field.appendChild(employee_img);
                };
                employee_img.id = "profession";
                employee_img.src = 'inputgallery/employee.png';
              } else if (mode_jobtitle === "Vice President") {
                let vice_president_img = new Image();
                vice_president_img.onload = function () {
                  output_field.appendChild(vice_president_img);
                };
                vice_president_img.id = "profession";
                vice_president_img.src = 'inputgallery/Vice President.jpg';
              } else {
                let professions_img = new Image();
                professions_img.onload = function () {
                  output_field.appendChild(professions_img);
                };
                professions_img.id = "profession";
                professions_img.src = 'inputgallery/all_proffesions.jpg';
              }

              let text_content_container_3 = document.createElement('p');
              text_content_container_3.innerHTML = "Most emails send towards people with the function of : " + mode_jobtitle +
                "<br />" + "Namely, in total: " + maximum_jobtitle +
                " emails" + "<br />" + "With an average sentiment towards people that have this function of: " +
                mean_sentiment_jobtitle;
              output_field.appendChild(text_content_container_3);
              text_content_container_3.id = "proffesions_text"

              let calendar_img = new Image();
              calendar_img.onload = function () {
                output_field.appendChild(calendar_img);
              };
              calendar_img.id = "calendar_imgage_css"
              calendar_img.src = 'inputgallery/calender_date_2.jpg'

              let text_content_container_4 = document.createElement('p');
              text_content_container_4.innerHTML = "Most emails send on: " + mode_date +
                "<br />" + "Namely, " + maximum_date + " emails" +
                "<br />" + "Sentiment on this day was: " +
                mean_sentiment_date;
              output_field.appendChild(text_content_container_4);
              text_content_container_4.id = "date_text"


              let all_dates_of_person = [];
              let combined_array_date_sentiment = [];
              console.log(grouped_data[input_specific][1].date);
              for (i = 0; i < Object.keys(grouped_data[input_specific]).length; i++) {
                all_dates_of_person.push(grouped_data[input_specific][i].date);
                combined_array_date_sentiment.push({ t: grouped_data[input_specific][i].date, y: grouped_data[input_specific][i].sentiment })
              }


              combined_array_date_sentiment.sort(function (a, b) {
                return new Date(a.t) - new Date(b.t);
              });

              all_dates_of_person.sort(function (a, b) {
                return new Date(a) - new Date(b);
              });

              //graph
              displayed_graph = true;
              var ctx = document.getElementById("graph_sentiment_date").getContext("2d");

              graph_sentiment_date_1 = new Chart(ctx, {
                type: 'line',
                data: {
                  labels: all_dates_of_person,
                  datasets: [{
                    label: 'sentiment',
                    data: combined_array_date_sentiment,
                    backgroundColor: [
                      'rgba(181, 208, 223, 0.2)',
                      'rgba(181, 208, 223, 0.2)',
                      'rgba(181, 208, 223, 0.2)',
                      'rgba(181, 208, 223, 0.2)',
                      'rgba(181, 208, 223, 0.2)',
                      'rgba(181, 208, 223, 0.2)'
                    ],
                    borderColor: [
                      'rgba(144, 212, 223,0.8)',
                      'rgba(144, 212, 223,0.8)',
                      'rgba(144, 212, 223,0.8)',
                      'rgba(144, 212, 223,0.8)',
                      'rgba(144, 212, 223,0.8)',
                      'rgba(144, 212, 223,0.8)'
                    ],
                    borderWidth: 2
                  }]
                },
                options: {
                  plugins: {
                    title: {
                      display: true,
                      text: 'sentiment change',
                      padding: {
                        top: 10,
                        bottom: 30
                      }
                    }
                  }
                }
              });

              //count amount of links between persons
              let toarray = [];
              let toarray_with_index = [];
              let links_emails = [];

              for (i = 0; i < all_datapoints.length; i++) {
                toarray.push(grouped_data[input_specific][i].toEmail);
              }


              for (var i = 0, j = toarray.length; i < j; i++) {
                toarray_with_index[toarray[i]] = (toarray_with_index[toarray[i]] || 0) + 1;
              }

              for (const [key, value] of Object.entries(toarray_with_index)) {
                links_emails.push({ "source": input_specific, "target": `${key}`, "value": value });
              }


              console.log(links_emails);

              let toarray_all = [];
              let toarray_with_index_all = [];
              let links_emails_all = [];
              let all_emails = [];
              let required_data_all = [];
              let all_datapoints_all = [];

              for (let t = 0; t < Object.keys(grouped_data).length; t++) {
                all_emails.push(Object.keys(grouped_data)[t]);
              }

              for (let h = 0; h < all_emails.length; h++) {
                toarray_all = [];

                for (i = 0; i < grouped_data[all_emails[h]].length; i++) {
                  toarray_all.push(grouped_data[all_emails[h]][i].toEmail);
                }

                for (var i = 0, j = toarray_all.length; i < j; i++) {
                  toarray_with_index_all[toarray_all[i]] = (toarray_with_index_all[toarray_all[i]] || 0) + 1;
                }

                for (const [key, value] of Object.entries(toarray_with_index_all)) {
                  links_emails_all.push({ "source": all_emails[h], "target": `${key}`, "value": value });
                }

              }

              console.log(links_emails_all);

              //chart how many emails per day
              all_dates_of_person = [];
              let date_amount_of_emails = [];
              let combined_amount_of_emails_date = [];
              console.log(grouped_data[input_specific][1].date);
              for (i = 0; i < Object.keys(grouped_data[input_specific]).length; i++) {
                all_dates_of_person.push(grouped_data[input_specific][i].date);
              }

              for (var i = 0, j = all_dates_of_person.length; i < j; i++) {
                date_amount_of_emails[all_dates_of_person[i]] = (date_amount_of_emails[all_dates_of_person[i]] || 0) + 1;
              }

              date_amount_of_emails.sort(function (a, b) {
                return new Date(a.t) - new Date(b.t);
              });

              let all_dates_of_person_uniques = [... new Set(all_dates_of_person)];

              all_dates_of_person_uniques.sort(function (a, b) {
                return new Date(a) - new Date(b);
              });


              for (const [key, value] of Object.entries(date_amount_of_emails)) {
                combined_amount_of_emails_date.push({ t: `${key}`, y: `${value}` })
              }

              //graph 2
              ctx = document.getElementById("graph_date_amount").getContext("2d");

              graph_date_amount_1 = new Chart(ctx, {
                type: 'bar',
                data: {
                  labels: all_dates_of_person_uniques,
                  datasets: [{
                    label: 'amount of emails',
                    data: combined_amount_of_emails_date,
                    backgroundColor: 'rgba(181, 208, 223, 0.2)',
                    borderColor: 'rgba(144, 212, 223,0.8)',
                    borderWidth: 2
                  }]
                },
                options: {
                  plugins: {
                    title: {
                      display: true,
                      text: 'amount of emails per day',
                      padding: {
                        top: 10,
                        bottom: 30
                      }
                    }
                  },
                  scales: {
                    xAxes: [{
                      display: true,
                      scaleLabel: {
                        display: true,
                        labelString: 'Day (for large datasets: hover over to get precise day)'
                      }
                    }],
                    yAxes: [{
                      display: true,
                      ticks: {
                        display: true,
                        labelString: 'Amount of emails',
                        beginAtZero: true,
                        steps: 1,
                        stepValue: 1,
                        max: (maximum_date + 1)
                      }
                    }]
                  }
                }
              });


            } else if (choice_zeros == true) {
              //mean sentiment without zero's
              const sentiment_array_no_zeros = sentiment_array.filter(sentiment => sentiment != 0);
              let sum_sentiment = sentiment_array_no_zeros.reduce((a, b) => a + b, 0);
              let mean_sentiment = sum_sentiment / (sentiment_array_no_zeros.length);
              console.log('mean sentiment is: ' + mean_sentiment);

              //get comunicating partners in array
              let communicating_partners = [];
              let communicating_partners_date = [];
              let communicating_partners_jobtitle = [];
              for (i = 0; i < all_datapoints.length; i++) {
                if (required_data[i].sentiment != 0) {
                  communicating_partners.push(required_data[i].toEmail);
                  communicating_partners_date.push(required_data[i].date);
                  communicating_partners_jobtitle.push(required_data[i].toJobtitle);
                };
              };


              //mode partner + sentiment to partner
              let maximum_partner = 0;
              let mode_partners;
              let frequency = {};
              for (var v in communicating_partners) {
                frequency[communicating_partners[v]] = (frequency[communicating_partners[v]] || 0) + 1;
                if (frequency[communicating_partners[v]] > maximum_partner) {
                  maximum_partner = frequency[communicating_partners[v]];
                  mode_partners = communicating_partners[v];
                }
              }
              console.log('most emails send to: ' + mode_partners + ' in total ' + maximum_partner);
              const emails_to_partner = required_data.filter(function (entry) {
                return entry.toEmail === mode_partners;
              });

              emails_to_partner_array = [];
              let sum = 0;
              for (i = 0; i < maximum_partner; i++) {
                sum = sum + emails_to_partner[i].sentiment
              }
              mean_sentiment_partner = sum / maximum_partner;
              console.log('with an average sentiment to this person of ' + mean_sentiment_partner);

              //mode date + sentiment on date
              let maximum_date = 0;
              let mode_date;
              frequency = {};
              for (var v in communicating_partners_date) {
                frequency[communicating_partners_date[v]] = (frequency[communicating_partners_date[v]] || 0) + 1;
                if (frequency[communicating_partners_date[v]] > maximum_date) {
                  maximum_date = frequency[communicating_partners_date[v]];
                  mode_date = communicating_partners_date[v];
                }
              }
              console.log('most emails send on ' + mode_date + ', namely: ' + maximum_date + ' emails')


              sum = 0;
              for (i = 0; i < all_datapoints.length; i++) {
                if (required_data[i].sentiment != 0) {
                  if (required_data[i].date === mode_date) {
                    sum = sum + required_data[i].sentiment
                  }
                };
              };
              let mean_sentiment_date = sum / maximum_date
              console.log('sentiment on this day was ' + mean_sentiment_date);

              //mode jobtitle + sentiment towards this jobtitle
              let maximum_jobtitle = 0;
              let mode_jobtitle;
              frequency = {};
              for (var v in communicating_partners_jobtitle) {
                frequency[communicating_partners_jobtitle[v]] = (frequency[communicating_partners_jobtitle[v]] || 0) + 1;
                if (frequency[communicating_partners_jobtitle[v]] > maximum_jobtitle) {
                  maximum_jobtitle = frequency[communicating_partners_jobtitle[v]];
                  mode_jobtitle = communicating_partners_jobtitle[v];
                }
              }
              console.log('most emails send towards ' + mode_jobtitle + ', namely: ' + maximum_jobtitle + ' emails')


              sum = 0;
              for (i = 0; i < all_datapoints.length; i++) {
                if (required_data[i].sentiment != 0) {
                  if (required_data[i].toJobtitle === mode_jobtitle) {
                    sum = sum + required_data[i].sentiment;
                  }
                };
              };
              let mean_sentiment_jobtitle = sum / maximum_jobtitle;
              console.log('sentiment towards people with this job is ' + mean_sentiment_jobtitle);


              //output:
              if (mean_sentiment >= 0) {
                let happy_face = new Image();

                happy_face.onload = function () {
                  output_field.appendChild(happy_face);
                };
                happy_face.id = "face"

                happy_face.src = 'inputgallery/happy_face.png'
              } else if (mean_sentiment == 0) {
                let neutral_face = new Image();

                neutral_face.onload = function () {
                  output_field.appendChild(neutral_face);
                };
                neutral_face.id = "face"

                neutral_face.src = 'inputgallery/neutral_face.png'

              } else if (mean_sentiment < 0) {
                let sad_face = new Image();

                sad_face.onload = function () {
                  output_field.appendChild(sad_face);
                };

                sad_face.id = "face"

                sad_face.src = 'inputgallery/sad_face.png'
              }

              let text_content_container = document.createElement('p');
              let text_content = document.createTextNode("Mean sentiment: " + mean_sentiment);
              text_content_container.appendChild(text_content);
              text_content_container.id = "text_mean_sentiment"
              output_field.appendChild(text_content_container);

              let partner_image = new Image();
              partner_image.onload = function () {
                output_field.appendChild(partner_image);
              };
              partner_image.id = "partner_imgage_css"
              partner_image.src = 'inputgallery/partners.jpg'

              let text_content_container_2 = document.createElement('p');
              text_content_container_2.innerHTML = "Best partners with: " + mode_partners +
                "<br />" + "In total: " + maximum_partner +
                " emails send to him/her" + "<br />" + "With an average sentiment of " +
                mean_sentiment_partner;
              output_field.appendChild(text_content_container_2);
              text_content_container_2.id = "partners_text"

              if (mode_jobtitle === "Trader") {
                let trader_img = new Image();
                trader_img.onload = function () {
                  output_field.appendChild(trader_img);
                };
                trader_img.id = "profession";
                trader_img.src = 'inputgallery/trader.png';
              } else if (mode_jobtitle === "Unknown") {
                let unknown_img = new Image();
                unknown_img.onload = function () {
                  output_field.appendChild(unknown_img);
                };
                unknown_img.id = "profession";
                unknown_img.src = 'inputgallery/unknown.jpg';
              } else if (mode_jobtitle === "Employee") {
                let employee_img = new Image();
                employee_img.onload = function () {
                  output_field.appendChild(employee_img);
                };
                employee_img.id = "profession";
                employee_img.src = 'inputgallery/employee.png';
              } else if (mode_jobtitle === "Vice President") {
                let vice_president_img = new Image();
                vice_president_img.onload = function () {
                  output_field.appendChild(vice_president_img);
                };
                vice_president_img.id = "profession";
                vice_president_img.src = 'inputgallery/Vice President.jpg';
              } else {
                let professions_img = new Image();
                professions_img.onload = function () {
                  output_field.appendChild(professions_img);
                };
                professions_img.id = "profession";
                professions_img.src = 'inputgallery/all_proffesions.jpg';
              }

              let text_content_container_3 = document.createElement('p');
              text_content_container_3.innerHTML = "Most emails send towards people with the function of : " + mode_jobtitle +
                "<br />" + "Namely, in total: " + maximum_jobtitle +
                " emails" + "<br />" + "With an average sentiment towards people that have this function of: " +
                mean_sentiment_jobtitle;
              output_field.appendChild(text_content_container_3);
              text_content_container_3.id = "proffesions_text"

              let calendar_img = new Image();
              calendar_img.onload = function () {
                output_field.appendChild(calendar_img);
              };
              calendar_img.id = "calendar_imgage_css"
              calendar_img.src = 'inputgallery/calender_date_2.jpg'

              let text_content_container_4 = document.createElement('p');
              text_content_container_4.innerHTML = "Most emails send on: " + mode_date +
                "<br />" + "Namely, " + maximum_date + " emails" +
                "<br />" + "Sentiment on this day was: " +
                mean_sentiment_date;
              output_field.appendChild(text_content_container_4);
              text_content_container_4.id = "date_text"

              let all_dates_of_person = [];
              let combined_array_date_sentiment = [];
              console.log(grouped_data[input_specific][1].date);
              for (i = 0; i < Object.keys(grouped_data[input_specific]).length; i++) {
                if (grouped_data[input_specific][i].sentiment !== 0) {
                  all_dates_of_person.push(grouped_data[input_specific][i].date);
                  combined_array_date_sentiment.push({ t: grouped_data[input_specific][i].date, y: grouped_data[input_specific][i].sentiment })
                }
              }

              console.log('date using mydata: ' + mydata[0].date);

              combined_array_date_sentiment.sort(function (a, b) {
                return new Date(a.t) - new Date(b.t);
              });

              all_dates_of_person.sort(function (a, b) {
                return new Date(a) - new Date(b);
              });

              //graph
              displayed_graph = true;
              var ctx = document.getElementById("graph_sentiment_date").getContext("2d");

              graph_sentiment_date_1 = new Chart(ctx, {
                type: 'line',
                data: {
                  labels: all_dates_of_person,
                  datasets: [{
                    label: 'sentiment',
                    data: combined_array_date_sentiment,
                    backgroundColor: [
                      'rgba(181, 208, 223, 0.2)',
                      'rgba(181, 208, 223, 0.2)',
                      'rgba(181, 208, 223, 0.2)',
                      'rgba(181, 208, 223, 0.2)',
                      'rgba(181, 208, 223, 0.2)',
                      'rgba(181, 208, 223, 0.2)'
                    ],
                    borderColor: [
                      'rgba(144, 212, 223,0.8)',
                      'rgba(144, 212, 223,0.8)',
                      'rgba(144, 212, 223,0.8)',
                      'rgba(144, 212, 223,0.8)',
                      'rgba(144, 212, 223,0.8)',
                      'rgba(144, 212, 223,0.8)'
                    ],
                    borderWidth: 2
                  }]
                },
                options: {
                  plugins: {
                    title: {
                      display: true,
                      text: 'sentiment change',
                      padding: {
                        top: 10,
                        bottom: 30
                      }
                    }
                  }
                }
              });

              //count amount of links between persons
              let toarray = [];
              let toarray_with_index = [];
              let links_emails = [];

              for (i = 0; i < all_datapoints.length; i++) {
                if (grouped_data[input_specific][i].sentiment !== 0) {
                  toarray.push(grouped_data[input_specific][i].incomming_edge);
                }
              }


              for (var i = 0, j = toarray.length; i < j; i++) {
                toarray_with_index[toarray[i]] = (toarray_with_index[toarray[i]] || 0) + 1;
              }

              for (const [key, value] of Object.entries(toarray_with_index)) {
                links_emails.push({ "source": input_specific, "target": `${key}`, "value": value });
              }


              console.log(toarray);

              let toarray_all = [];
              let toarray_with_index_all = [];
              let links_emails_all = [];
              let all_emails = [];
              let required_data_all = [];
              let all_datapoints_all = [];

              for (let t = 0; t < Object.keys(grouped_data).length; t++) {
                all_emails.push(Object.keys(grouped_data)[t]);
              }

              for (let h = 0; h < all_emails.length; h++) {
                toarray_all = [];

                for (i = 0; i < grouped_data[all_emails[h]].length; i++) {
                  if (grouped_data[all_emails[h]][i].sentiment !== 0) {
                    toarray_all.push(grouped_data[all_emails[h]][i].toEmail);
                  }
                }

                for (var i = 0, j = toarray_all.length; i < j; i++) {
                  toarray_with_index_all[toarray_all[i]] = (toarray_with_index_all[toarray_all[i]] || 0) + 1;
                }

                for (const [key, value] of Object.entries(toarray_with_index_all)) {
                  links_emails_all.push({ "source": all_emails[h], "target": `${key}`, "value": value });
                }

              }

              console.log(links_emails_all);

              //chart how many emails per day
              all_dates_of_person = [];
              let date_amount_of_emails = [];
              let combined_amount_of_emails_date = [];
              console.log(grouped_data[input_specific][1].date);
              for (i = 0; i < Object.keys(grouped_data[input_specific]).length; i++) {
                if (grouped_data[input_specific][i].sentiment !== 0) {
                  all_dates_of_person.push(grouped_data[input_specific][i].date);
                }
              }

              for (var i = 0, j = all_dates_of_person.length; i < j; i++) {
                date_amount_of_emails[all_dates_of_person[i]] = (date_amount_of_emails[all_dates_of_person[i]] || 0) + 1;
              }

              date_amount_of_emails.sort(function (a, b) {
                return new Date(a.t) - new Date(b.t);
              });

              let all_dates_of_person_uniques = [... new Set(all_dates_of_person)];

              all_dates_of_person_uniques.sort(function (a, b) {
                return new Date(a) - new Date(b);
              });


              for (const [key, value] of Object.entries(date_amount_of_emails)) {
                combined_amount_of_emails_date.push({ t: `${key}`, y: `${value}` })
              }

              console.log(all_dates_of_person_uniques);

              //graph 2
              ctx = document.getElementById("graph_date_amount").getContext("2d");

              graph_date_amount_1 = new Chart(ctx, {
                type: 'bar',
                data: {
                  labels: all_dates_of_person_uniques,
                  datasets: [{
                    label: 'amount of emails',
                    data: combined_amount_of_emails_date,
                    backgroundColor: 'rgba(181, 208, 223, 0.2)',
                    borderColor: 'rgba(144, 212, 223,0.8)',
                    borderWidth: 2
                  }]
                },
                options: {
                  plugins: {
                    title: {
                      display: true,
                      text: 'amount of emails per day',
                      padding: {
                        top: 10,
                        bottom: 30
                      }
                    }
                  },
                  scales: {
                    xAxes: [{
                      display: true,
                      scaleLabel: {
                        display: true,
                        labelString: 'Day (for large datasets: hover over to get precise day)'
                      }
                    }],
                    yAxes: [{
                      display: true,
                      ticks: {
                        display: true,
                        labelString: 'Amount of emails',
                        beginAtZero: true,
                        steps: 1,
                        stepValue: 1,
                        max: (maximum_date + 1)
                      }
                    }]
                  }
                }
              });

              //group on 'incomming edge':
              grouped_data_incomming = groupBy(mydata, 'incomming_edge');

              toarray_all = [];
              toarray_with_index_all = [];
              links_emails_all = [];
              all_emails = [];
              required_data_all = [];
              all_datapoints_all = [];
              unique_outgoing_edges_per_incomming_edge = [];

              //function we need for counting unique outgoing edges per incomming edge:
              let counting_uniques = function (items, prop) {
                let results = {}
                for (let i = 0, len = items.length; i < len; i++) {
                  let value = items[i][prop];
                  let count = (results[value] || 0) + 1;
                  results[value] = count;
                }
                let ranked = []
                for (let key in results) {
                  if (results.hasOwnProperty(key)) {
                    ranked.push({ value: key, count: results[key] });
                  }
                }
                return ranked.sort(function (a, b) { return b.count - a.count; });
              }

              //loops over data
              for (let t = 1; t < (Object.keys(grouped_data_incomming).length) + 1; t++) {
                unique_outgoing_edges_per_incomming_edge = [];
                unique_outgoing_edges_per_incomming_edge = counting_uniques(grouped_data_incomming[t], "outgoing_edge");
                for (let i = 0; i < unique_outgoing_edges_per_incomming_edge.length; i++) {
                  links_emails_all.push({ source: t, target: parseInt(unique_outgoing_edges_per_incomming_edge[i].value), value: unique_outgoing_edges_per_incomming_edge[i].count })
                }
              }














            }
          }
        }










      }
    });
  } else {
    customtext.innerHTML = "(No dataset selected yet)"
  }
})

refresh_btn.addEventListener('click', function (e) {
  keep_filtering_boolean = false;
  document.getElementById("keep_filtering").style.display = "none";
  document.getElementById("keep_filtering_lable").style.display = "none";
  advanced_number_variable_field.value = '';
  advanced_equation_variable_field.value = '';
  advanced_input_variable_field.value = '';
  if (displayed_graph == true || entered_something_in_input_collector == true) { //check if graph exists; if so, destroy it
    graph_sentiment_date_1.destroy();
    graph_date_amount_1.destroy();
    if (pi_chart_exists == true) {
      pi_chart_to.destroy();
      pi_chart_from.destroy();
      job_title_sentiment.destroy();
      pi_chart_exists = false;
    }
    output_field.innerHTML = '';
    input_email_field.value = '';
    displayed_graph = false;
    displayed_advanced_output = false;

  } else {
    alert('Before refreshing, add some values')
  }

})

//equation button
list_of_equations = ["greater than", "equal to", "smaller than"]
list_of_equations.forEach((element, index) => {
  new_option = document.createElement("option");
  new_option.value = element;
  document.getElementById("equation_list").appendChild(new_option);
});


function renameKey(obj, oldKey, newKey) {
  obj[newKey] = obj[oldKey];
  delete obj[oldKey];
}

function advanced_statistics(grouped_data, all_data, advanced_variable_selection, advanced_equation_selection, advanced_number_selection, advanced_if_statement, choice_zeros) {

  let filtered_data = [];

  if (advanced_equation_selection == "==") {
    if (advanced_variable_selection == "Id_node") {
      filtered_data = all_data.filter(d => d.Id_node == advanced_number_selection);
    } else if (advanced_variable_selection == "incomming_edge") {
      filtered_data = all_data.filter(d => d.incomming_edge == advanced_number_selection);
    } else if (advanced_variable_selection == "outgoing_edge") {
      filtered_data = all_data.filter(d => d.outgoing_edge == advanced_number_selection);
    } else if (advanced_variable_selection == "sentiment") {
      filtered_data = all_data.filter(d => d.sentiment == advanced_number_selection);
    } else if (advanced_variable_selection == "fromJobtitle") {
      filtered_data = all_data.filter(d => d.fromJobtitle == advanced_number_selection);
    } else if (advanced_variable_selection == "messageType") {
      filtered_data = all_data.filter(d => d.messageType == advanced_number_selection);
    } else if (advanced_variable_selection == "toJobtitle") {
      filtered_data = all_data.filter(d => d.toJobtitle == advanced_number_selection);
    } else if (advanced_variable_selection == "toEmail") {
      filtered_data = all_data.filter(d => d.toEmail == advanced_number_selection);
    } else if (advanced_variable_selection == "date") {
      filtered_data = all_data.filter(d => d.date == advanced_number_selection);
    }
  } else if (advanced_equation_selection == ">") {
    if (advanced_variable_selection == "Id_node") {
      alert("Not logical, please use 'equal to' when selecting a specific " + advanced_variable_selection)
    } else if (advanced_variable_selection == "incomming_edge") {
      filtered_data = all_data.filter(d => d.incomming_edge > advanced_number_selection);
    } else if (advanced_variable_selection == "outgoing_edge") {
      filtered_data = all_data.filter(d => d.outgoing_edge > advanced_number_selection);
    } else if (advanced_variable_selection == "sentiment") {
      filtered_data = all_data.filter(d => d.sentiment > advanced_number_selection);
    } else if (advanced_variable_selection == "fromJobtitle") {
      alert("Not logical, please use 'equal to' when selecting a specific " + advanced_variable_selection)
    } else if (advanced_variable_selection == "messageType") {
      alert("Not logical, please use 'equal to' when selecting a specific " + advanced_variable_selection)
    } else if (advanced_variable_selection == "toJobtitle") {
      alert("Not logical, please use 'equal to' when selecting a specific " + advanced_variable_selection);
    } else if (advanced_variable_selection == "toEmail") {
      alert("Not logical, please use 'equal to' when selecting a specific " + advanced_variable_selection)
    } else if (advanced_variable_selection == "date") {
      filtered_data = all_data.filter(d => JSON.stringify(d.date) > JSON.stringify(advanced_number_selection));
    }
  } else if (advanced_equation_selection == "<") {
    if (advanced_variable_selection == "Id_node") {
      alert("Not logical, please use 'equal to' when selecting a specific " + advanced_variable_selection)
    } else if (advanced_variable_selection == "incomming_edge") {
      filtered_data = all_data.filter(d => d.incomming_edge < advanced_number_selection);
    } else if (advanced_variable_selection == "outgoing_edge") {
      filtered_data = all_data.filter(d => d.outgoing_edge < advanced_number_selection);
    } else if (advanced_variable_selection == "sentiment") {
      filtered_data = all_data.filter(d => d.sentiment < advanced_number_selection);
    } else if (advanced_variable_selection == "fromJobtitle") {
      alert("Not logical, please use 'equal to' when selecting a specific " + advanced_variable_selection)
    } else if (advanced_variable_selection == "messageType") {
      alert("Not logical, please use 'equal to' when selecting a specific " + advanced_variable_selection)
    } else if (advanced_variable_selection == "toJobtitle") {
      alert("Not logical, please use 'equal to' when selecting a specific " + advanced_variable_selection);
    } else if (advanced_variable_selection == "toEmail") {
      alert("Not logical, please use 'equal to' when selecting a specific " + advanced_variable_selection)
    } else if (advanced_variable_selection == "date") {
      filtered_data = all_data.filter(d => JSON.stringify(d.date) < JSON.stringify(advanced_number_selection));
    }
  }
  console.log('filtered_data', filtered_data);
  window.filtered_data = filtered_data
  return filtered_data
}





function statistics_updated(filtered_data, choice_zeros) {
  console.log('hello')

  if (choice_zeros == true) {
    filtered_data = filtered_data.filter(d => d.sentiment != 0);
    console.log('zeros removed')
    console.log(filtered_data)
    if (filtered_data.length == 0) {
      alert("No valid selection. Maybe remove 'exclude zero's?' ")
    }
  }


  let all_datapoints = Object.keys(filtered_data);

  let sentiment_array = [];
  all_datapoints.forEach(element => sentiment_array.push(filtered_data[element].sentiment));

  //mean sentiment without zero's
  let sum_sentiment = sentiment_array.reduce((a, b) => a + b, 0);
  let mean_sentiment = sum_sentiment / (sentiment_array.length);
  console.log('mean sentiment is: ' + mean_sentiment);

  //get mode person

  mode_person_array = [];
  for (i = 0; i < all_datapoints.length; i++) {
    mode_person_array.push(filtered_data[i].Id_node)
  }
  console.log(filtered_data)
  console.log(mode_person_array)


  let maximum_person = 0;
  let mode_person;
  let frequency = {};
  for (var v in mode_person_array) {
    frequency[mode_person_array[v]] = (frequency[mode_person_array[v]] || 0) + 1;
    if (frequency[mode_person_array[v]] > maximum_person) {
      maximum_person = frequency[mode_person_array[v]];
      mode_person = mode_person_array[v];
    }
  }
  console.log('most emails send by ' + mode_person + ', namely: ' + maximum_person + ' emails')






  //get comunicating partners in array
  let communicating_partners = [];
  let communicating_partners_date = [];
  let communicating_partners_jobtitle = [];
  for (i = 0; i < all_datapoints.length; i++) {
    communicating_partners.push(filtered_data[i].toEmail);
    communicating_partners_date.push(filtered_data[i].date);
    communicating_partners_jobtitle.push(filtered_data[i].toJobtitle);
  };


  let maximum_partner = 0;
  let mode_partners;
  frequency = {};
  for (var v in communicating_partners) {
    frequency[communicating_partners[v]] = (frequency[communicating_partners[v]] || 0) + 1;
    if (frequency[communicating_partners[v]] > maximum_partner) {
      maximum_partner = frequency[communicating_partners[v]];
      mode_partners = communicating_partners[v];
    }
  }
  console.log('most emails send to: ' + mode_partners + ' in total ' + maximum_partner);
  const emails_to_partner = filtered_data.filter(function (entry) {
    return entry.toEmail === mode_partners;
  });

  emails_to_partner_array = [];
  let sum = 0;
  for (i = 0; i < maximum_partner; i++) {
    sum = sum + emails_to_partner[i].sentiment
  }
  mean_sentiment_partner = sum / maximum_partner;
  console.log('with an average sentiment to this person of ' + mean_sentiment_partner);

  //mode date + sentiment on date
  let maximum_date = 0;
  let mode_date;
  frequency = {};
  for (var v in communicating_partners_date) {
    frequency[communicating_partners_date[v]] = (frequency[communicating_partners_date[v]] || 0) + 1;
    if (frequency[communicating_partners_date[v]] > maximum_date) {
      maximum_date = frequency[communicating_partners_date[v]];
      mode_date = communicating_partners_date[v];
    }
  }
  console.log('most emails send on ' + mode_date + ', namely: ' + maximum_date + ' emails')


  sum = 0;
  for (i = 0; i < all_datapoints.length; i++) {
    if (filtered_data[i].date === mode_date) {
      sum = sum + filtered_data[i].sentiment
    };
  };
  let mean_sentiment_date = sum / maximum_date
  console.log('sentiment on this day was ' + mean_sentiment_date);

  //mode jobtitle + sentiment towards this jobtitle
  let maximum_jobtitle = 0;
  let mode_jobtitle;
  frequency = {};
  for (var v in communicating_partners_jobtitle) {
    frequency[communicating_partners_jobtitle[v]] = (frequency[communicating_partners_jobtitle[v]] || 0) + 1;
    if (frequency[communicating_partners_jobtitle[v]] > maximum_jobtitle) {
      maximum_jobtitle = frequency[communicating_partners_jobtitle[v]];
      mode_jobtitle = communicating_partners_jobtitle[v];
    }
  }
  console.log('most emails send towards ' + mode_jobtitle + ', namely: ' + maximum_jobtitle + ' emails')


  sum = 0;
  for (i = 0; i < all_datapoints.length; i++) {
    if (filtered_data[i].toJobtitle === mode_jobtitle) {
      sum = sum + filtered_data[i].sentiment;
    };
  };
  let mean_sentiment_jobtitle = sum / maximum_jobtitle;
  console.log('sentiment towards people with this job is ' + mean_sentiment_jobtitle);

  //output:
  if (mean_sentiment >= 0) {
    let happy_face = new Image();

    happy_face.onload = function () {
      output_field.appendChild(happy_face);
    };
    happy_face.id = "face"

    happy_face.src = 'inputgallery/happy_face.png'
  } else if (mean_sentiment == 0) {
    let neutral_face = new Image();

    neutral_face.onload = function () {
      output_field.appendChild(neutral_face);
    };
    neutral_face.id = "face"

    neutral_face.src = 'inputgallery/neutral_face.png'

  } else if (mean_sentiment < 0) {
    let sad_face = new Image();

    sad_face.onload = function () {
      output_field.appendChild(sad_face);
    };

    sad_face.id = "face"

    sad_face.src = 'inputgallery/sad_face.png'
  }

  let text_content_container = document.createElement('p');
  let text_content = document.createTextNode("Mean sentiment: " + mean_sentiment);
  text_content_container.appendChild(text_content);
  text_content_container.id = "text_mean_sentiment"
  output_field.appendChild(text_content_container);

  let partner_image = new Image();
  partner_image.onload = function () {
    output_field.appendChild(partner_image);
  };
  partner_image.id = "partner_imgage_css"
  partner_image.src = 'inputgallery/partners.jpg'

  let text_content_container_2 = document.createElement('p');
  text_content_container_2.innerHTML = "Most emails send by: " + mode_person +
    " <br /> He/she is best partners with: " + mode_partners +
    "<br />" + "In total: " + maximum_partner +
    " emails send to him/her" + "<br />" + "With an average sentiment of " +
    mean_sentiment_partner;
  output_field.appendChild(text_content_container_2);
  text_content_container_2.id = "partners_text"

  if (mode_jobtitle === "Trader") {
    let trader_img = new Image();
    trader_img.onload = function () {
      output_field.appendChild(trader_img);
    };
    trader_img.id = "profession";
    trader_img.src = 'inputgallery/trader.png';
  } else if (mode_jobtitle === "Unknown") {
    let unknown_img = new Image();
    unknown_img.onload = function () {
      output_field.appendChild(unknown_img);
    };
    unknown_img.id = "profession";
    unknown_img.src = 'inputgallery/unknown.jpg';
  } else if (mode_jobtitle === "Employee") {
    let employee_img = new Image();
    employee_img.onload = function () {
      output_field.appendChild(employee_img);
    };
    employee_img.id = "profession";
    employee_img.src = 'inputgallery/employee.png';
  } else if (mode_jobtitle === "Vice President") {
    let vice_president_img = new Image();
    vice_president_img.onload = function () {
      output_field.appendChild(vice_president_img);
    };
    vice_president_img.id = "profession";
    vice_president_img.src = 'inputgallery/Vice President.jpg';
  } else {
    let professions_img = new Image();
    professions_img.onload = function () {
      output_field.appendChild(professions_img);
    };
    professions_img.id = "profession";
    professions_img.src = 'inputgallery/all_proffesions.jpg';
  }

  let text_content_container_3 = document.createElement('p');
  text_content_container_3.innerHTML = "Most emails send towards people with the function of : " + mode_jobtitle +
    "<br />" + "Namely, in total: " + maximum_jobtitle +
    " emails" + "<br />" + "With an average sentiment towards people that have this function of: " +
    mean_sentiment_jobtitle;
  output_field.appendChild(text_content_container_3);
  text_content_container_3.id = "proffesions_text"

  let calendar_img = new Image();
  calendar_img.onload = function () {
    output_field.appendChild(calendar_img);
  };
  calendar_img.id = "calendar_imgage_css"
  calendar_img.src = 'inputgallery/calender_date_2.jpg'

  let text_content_container_4 = document.createElement('p');
  text_content_container_4.innerHTML = "Most emails send on: " + mode_date +
    "<br />" + "Namely, " + maximum_date + " emails" +
    "<br />" + "Sentiment on this day was: " +
    mean_sentiment_date;
  output_field.appendChild(text_content_container_4);
  text_content_container_4.id = "date_text"


  let all_dates_of_person = [];
  let combined_array_date_sentiment = [];


  for (i = 0; i < Object.keys(filtered_data).length; i++) {
    all_dates_of_person.push(filtered_data[i].date);
    combined_array_date_sentiment.push({ t: filtered_data[i].date, y: filtered_data[i].sentiment })
  }


  combined_array_date_sentiment.sort(function (a, b) {
    return new Date(a.t) - new Date(b.t);
  });

  all_dates_of_person.sort(function (a, b) {
    return new Date(a) - new Date(b);
  });

  //graph
  displayed_graph = true;
  var ctx = document.getElementById("graph_sentiment_date").getContext("2d");

  graph_sentiment_date_1 = new Chart(ctx, {
    type: 'line',
    data: {
      labels: all_dates_of_person,
      datasets: [{
        label: 'sentiment',
        data: combined_array_date_sentiment,
        backgroundColor: [
          'rgba(181, 208, 223, 0.2)',
          'rgba(181, 208, 223, 0.2)',
          'rgba(181, 208, 223, 0.2)',
          'rgba(181, 208, 223, 0.2)',
          'rgba(181, 208, 223, 0.2)',
          'rgba(181, 208, 223, 0.2)'
        ],
        borderColor: [
          'rgba(144, 212, 223,0.8)',
          'rgba(144, 212, 223,0.8)',
          'rgba(144, 212, 223,0.8)',
          'rgba(144, 212, 223,0.8)',
          'rgba(144, 212, 223,0.8)',
          'rgba(144, 212, 223,0.8)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'sentiment change',
          padding: {
            top: 10,
            bottom: 30
          }
        }
      }
    }
  });

  //chart how many emails per day
  all_dates_of_person = [];
  let date_amount_of_emails = [];
  let combined_amount_of_emails_date = [];
  for (i = 0; i < Object.keys(filtered_data).length; i++) {
    all_dates_of_person.push(filtered_data[i].date);
  }

  for (var i = 0, j = all_dates_of_person.length; i < j; i++) {
    date_amount_of_emails[all_dates_of_person[i]] = (date_amount_of_emails[all_dates_of_person[i]] || 0) + 1;
  }

  date_amount_of_emails.sort(function (a, b) {
    return new Date(a.t) - new Date(b.t);
  });

  let all_dates_of_person_uniques = [... new Set(all_dates_of_person)];

  all_dates_of_person_uniques.sort(function (a, b) {
    return new Date(a) - new Date(b);
  });


  for (const [key, value] of Object.entries(date_amount_of_emails)) {
    combined_amount_of_emails_date.push({ t: `${key}`, y: `${value}` })
  }

  //graph 2
  ctx = document.getElementById("graph_date_amount").getContext("2d");

  graph_date_amount_1 = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: all_dates_of_person_uniques,
      datasets: [{
        label: 'amount of emails',
        data: combined_amount_of_emails_date,
        backgroundColor: 'rgba(181, 208, 223, 0.2)',
        borderColor: 'rgba(144, 212, 223,0.8)',
        borderWidth: 2
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'amount of emails per day',
          padding: {
            top: 10,
            bottom: 30
          }
        }
      },
      scales: {
        xAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Day (for large datasets: hover over to get precise day)'
          }
        }],
        yAxes: [{
          display: true,
          ticks: {
            display: true,
            labelString: 'Amount of emails',
            beginAtZero: true,
            steps: 1,
            stepValue: 1,
            max: (maximum_date + 1)
          }
        }]
      }
    }
  });

  //pi-chart from_jobs
  let all_jobs = [];
  let counts_jobtitle = {};
  let all_job_title_value = [];
  let random_colors = [];

  for (i = 0; i < Object.keys(filtered_data).length; i++) {
    all_jobs.push(filtered_data[i].fromJobtitle);
  }

  for (var i = 0, j = all_jobs.length; i < j; i++) {
    all_job_title_value[all_jobs[i]] = (all_job_title_value[all_jobs[i]] || 0) + 1;
  }



  let all_job_values = [];
  for (let i = 0; i < (Object.keys(all_job_title_value)).length; i++) {
    all_job_values.push(all_job_title_value[Object.keys(all_job_title_value)[i]])
    random_colors.push("#" + Math.floor(Math.random() * 16777215).toString(16));
  }

  //chart itself
  ctx = document.getElementById("pi_chart_from").getContext("2d");

  pi_chart_from = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(all_job_title_value),
      datasets: [{
        label: "amount of emails",
        backgroundColor: random_colors,
        data: all_job_values
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Job titles (emails sent by)'
      }
    }
  });

  //pi-chart from_jobs
  all_jobs = [];
  counts_jobtitle = {};
  all_job_title_value = [];
  //random_colors = [];

  for (i = 0; i < Object.keys(filtered_data).length; i++) {
    all_jobs.push(filtered_data[i].toJobtitle);
  }

  for (var i = 0, j = all_jobs.length; i < j; i++) {
    all_job_title_value[all_jobs[i]] = (all_job_title_value[all_jobs[i]] || 0) + 1;
  }

  console.log(all_job_title_value);
  console.log(Object.keys(all_job_title_value));

  all_job_values = [];
  for (let i = 0; i < (Object.keys(all_job_title_value)).length; i++) {
    all_job_values.push(all_job_title_value[Object.keys(all_job_title_value)[i]])
    random_colors.push("#" + Math.floor(Math.random() * 16777215).toString(16));
  }
  console.log(all_job_values)
  console.log(random_colors)

  //chart itself
  ctx = document.getElementById("pi_chart_to").getContext("2d");

  pi_chart_to = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(all_job_title_value),
      datasets: [{
        label: "amount of emails",
        backgroundColor: random_colors,
        data: all_job_values
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Job titles (emails sent to)'
      }
    }
  });

  console.log(combined_amount_of_emails_date)

  //graph amount of sentiment per jobtitle

  let sentiment_per_jobtitle = [];
  let combined_sentiment_per_jobtitle = [];
  let only_one_jobtitle = [];
  all_jobs = [];

  for (i = 0; i < Object.keys(filtered_data).length; i++) {
    all_jobs.push(filtered_data[i].fromJobtitle);
  }

  let unique_jobs = [... new Set(all_jobs)];

  for (let i = 0; i < unique_jobs.length; i++) {
    only_one_jobtitle = filtered_data.filter(({ fromJobtitle }) => fromJobtitle == unique_jobs[i]),
      sentiment_per_jobtitle[unique_jobs[i]] = only_one_jobtitle.reduce((r, c) => r + c.sentiment, 0) / only_one_jobtitle.length;
  }


  console.log(sentiment_per_jobtitle)

  for (const [key, value] of Object.entries(sentiment_per_jobtitle)) {
    combined_sentiment_per_jobtitle.push({ t: `${key}`, y: `${value}` })
  }
  console.log(combined_sentiment_per_jobtitle)

  //bar chart sentiment jobtitle
  ctx = document.getElementById("job_title_sentiment").getContext("2d");

  job_title_sentiment = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: unique_jobs,
      datasets: [{
        label: 'Sentiment',
        data: combined_sentiment_per_jobtitle,
        backgroundColor: 'rgba(181, 208, 223, 0.2)',
        borderColor: 'rgba(144, 212, 223,0.8)',
        borderWidth: 2
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'sentiment per jobtitle',
          padding: {
            top: 10,
            bottom: 30
          }
        }
      },
      scales: {
        xAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Jobtitle'
          }
        }],
        yAxes: [{
          display: true,
          ticks: {
            display: true,
            labelString: 'Sentiment',
            beginAtZero: true,
            steps: 1,
            stepValue: 1,
          }
        }]
      }
    }
  });


  pi_chart_exists = true;
  displayed_advanced_output = true;



}
