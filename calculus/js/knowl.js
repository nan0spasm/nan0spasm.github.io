/* 
 * Knowl - Feature Demo for Knowls
 * Copyright (C) 2011  Harald Schilly
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * 4/11/2012 Modified by David Guichard to allow inline knowl code.
 * Sample use:
 *      This is an <a knowl="" class="internal" 
 *      value="Hello World!">inline knowl.</a>
 */

/* javascript code for the knowl features 
 * global counter, used to uniquely identify each knowl-output element
 * that's necessary because the same knowl could be referenced several times
 * on the same page */
var knowl_id_counter = 0;
 
function knowl_click_handler($el) {
  // the knowl attribute holds the id of the knowl
  var knowl_id = $el.attr("knowl");
  // the uid is necessary if we want to reference the same content several times
  var uid = $el.attr("knowl-uid");
  var output_id = '#knowl-output-' + uid; 
  var $output_id = $(output_id);
  // create the element for the content, insert it after the one where the 
  // knowl element is included (e.g. inside a <h1> tag) (sibling in DOM)
  var idtag = "id='"+output_id.substring(1) + "'";
  var kid   = "id='kuid-"+ uid + "'";
  // if we already have the content, toggle visibility
  if ($output_id.length > 0) {
     $("#kuid-"+uid).slideToggle("fast");
     $el.toggleClass("active");
 
  // otherwise download it or get it from the cache
  } else { 
    var knowl = "<div class='knowl-output' "+kid+"><div class='knowl'><div class='knowl-content' " +idtag+ ">loading '"+knowl_id+"'</div><div class='knowl-footer'>"+knowl_id+"</div></div></div>";
    
    // check, if the knowl is inside a td or th in a table. otherwise assume its
    // properly sitting inside a <div> or <p>
    if($el.parent().is("td") || $el.parent().is("th") ) {
      // assume we are in a td or th tag, go 2 levels up
      var cols = $el.parent().parent().children().length;
      $el.parent().parent().after(
          "<tr><td colspan='"+cols+"'>"+knowl+"</td></tr>");
    } else {
      $el.parent().after(knowl);
    }
   
    // "select" where the output is and get a hold of it 
    var $output = $(output_id);
    var $knowl = $("#kuid-"+uid);
    $output.addClass("loading");
    $knowl.show();
    // DRG: inline code
    if ($el.attr("class") == 'internal') {
      $output.html($el.attr("value"));
      $knowl.hide();
      $el.addClass("active");
      if(window.MathJax == undefined) {
            $knowl.slideDown("slow");
      }  else {
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, $output.get(0)]);
            MathJax.Hub.Queue([ function() { $knowl.slideDown("slow"); }]);
      }
    } else {
    // Get code from server.
    $output.load(knowl_id,
     function(response, status, xhr) { 
      $knowl.removeClass("loading");
      if (status == "error") {
        $el.removeClass("active");
        $output.html("<div class='knowl-output error'>ERROR: " + xhr.status + " " + xhr.statusText + '</div>');
      } else if (status == "timeout") {
        $el.removeClass("active");
        $output.html("<div class='knowl-output error'>ERROR: timeout. " + xhr.status + " " + xhr.statusText + '</div>');
      } else {
        $knowl.hide();
        $el.addClass("active");
      }
      // if we are using MathJax, then we reveal the knowl after it has finished rendering the contents
      if(window.MathJax == undefined) {
            $knowl.slideDown("slow");
      }  else {
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, $output.get(0)]);
            MathJax.Hub.Queue([ function() { $knowl.slideDown("slow"); }]);
      }
     }); 
    }
  }
} //~~ end click handler for *[knowl] elements

/** register a click handler for each element with the knowl attribute 
 * @see jquery's doc about 'live'! the handler function does the 
 *  download/show/hide magic. also add a unique ID, 
 *  necessary when the same reference is used several times. */
$(function() {
  $(document).on({
    click: function(evt) {
      evt.preventDefault();
      var $knowl = $(this);
      if(!$knowl.attr("knowl-uid")) {
        $knowl.attr("knowl-uid", knowl_id_counter);
        knowl_id_counter++;
      }
      knowl_click_handler($knowl, evt);
    }
  },"*[knowl]");
});

