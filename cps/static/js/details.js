/* This file is part of the Calibre-Web (https://github.com/janeczku/calibre-web)
 *    Copyright (C) 2018-2023 jkrehm, OzzieIsaacs
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

/* global _ */

function handleResponse (data) {
    $(".row-fluid.text-center").remove();
    $("#flash_danger").remove();
    $("#flash_success").remove();
    if (!jQuery.isEmptyObject(data)) {
        if($("#bookDetailsModal").is(":visible")) {
            data.forEach(function (item) {
                $(".modal-header").after('<div id="flash_' + item.type +
                    '" class="text-center alert alert-' + item.type + '">' + item.message + '</div>');
            });
        } else {
            data.forEach(function (item) {
                $(".navbar").after('<div class="row-fluid text-center">' +
                    '<div id="flash_' + item.type + '" class="alert alert-' + item.type + '">' + item.message + '</div>' +
                    '</div>');
            });
        }
    }
}
$(".sendbtn-form").click(function() {
    var $btn = $(this);

    function doSend() {
        $.ajax({
            method: "post",
            url: $btn.data("href"),
            data: {csrf_token: $("input[name='csrf_token']").val()},
            success: function (data) { handleResponse(data); }
        });
    }

    if ($btn.data("kindle-warned")) {
        if (!$("#kindle-dup-modal").length) {
            $("body").append(
                '<div class="modal fade" id="kindle-dup-modal" tabindex="-1" role="dialog" aria-labelledby="kindle-dup-title">' +
                '<div class="modal-dialog modal-sm" role="document">' +
                '<div class="modal-content">' +
                '<div class="modal-header">' +
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span></button>' +
                '<h4 class="modal-title" id="kindle-dup-title">' +
                '<span class="glyphicon glyphicon-warning-sign"></span> Already sent to Kindle</h4>' +
                '</div>' +
                '<div class="modal-body">This book was already sent to your Kindle. Send it again?</div>' +
                '<div class="modal-footer">' +
                '<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>' +
                '<button type="button" class="btn btn-warning" id="kindle-dup-confirm">Send Duplicate</button>' +
                '</div></div></div></div>'
            );
        }
        $("#kindle-dup-modal").modal("show");
        $("#kindle-dup-modal").one("click", "#kindle-dup-confirm", function() {
            $("#kindle-dup-modal").modal("hide");
            doSend();
        });
    } else {
        doSend();
    }
});

$(function() {
    var $w = $(".kindle-sent-warning[data-utc]");
    if ($w.length) {
        var utc = $w.data("utc");
        var d = new Date(utc);
        if (!isNaN(d)) {
            var pad = function(n) { return String(n).padStart(2, "0"); };
            var local = pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear() +
                        ", " + pad(d.getHours()) + ":" + pad(d.getMinutes());
            $w.find(".kindle-sent-date").text("Sent to Kindle on " + local);
        }
    }
});

$(function() {
    $("#have_read_form").ajaxForm();
});

$("#have_read_cb").on("change", function() {
    $.ajax({
        url: this.closest("form").action,
        method:"post",
        data: $(this).closest("form").serialize(),
        error: function(response) {
            var data = [{type:"danger", message:response.responseText}]
            // $("#flash_success").parent().remove();
            $("#flash_danger").remove();
            $(".row-fluid.text-center").remove();
            if (!jQuery.isEmptyObject(data)) {
                $("#have_read_cb").prop("checked", !$("#have_read_cb").prop("checked"));
                if($("#bookDetailsModal").is(":visible")) {
                    data.forEach(function (item) {
                        $(".modal-header").after('<div id="flash_' + item.type +
                            '" class="text-center alert alert-' + item.type + '">' + item.message + '</div>');
                    });
                } else
                {
                    data.forEach(function (item) {
                        $(".navbar").after('<div class="row-fluid text-center" >' +
                            '<div id="flash_' + item.type + '" class="alert alert-' + item.type + '">' + item.message + '</div>' +
                            '</div>');
                    });
                }
            }
        }
    });
});

$(function() {
    $("#archived_form").ajaxForm();
});

$("#archived_cb").on("change", function() {
    $(this).closest("form").submit();
});

$(document).on("click", ".downloadBtn > #btnGroupDrop1", function (e) {
    var $button = $(this);
    var $group = $button.closest(".downloadBtn");
    var $menu = $group.children("ul.dropdown-menu");
    var isOpen = $button.attr("aria-expanded") === "true";

    e.preventDefault();
    e.stopPropagation();

    $(".downloadBtn.open").not($group).removeClass("open").children("ul.dropdown-menu").hide();
    $(".downloadBtn > #btnGroupDrop1").not($button).attr("aria-expanded", "false");

    if (isOpen) {
        $group.removeClass("open");
        $button.attr("aria-expanded", "false");
        $menu.hide();
    } else {
        $group.addClass("open");
        $button.attr("aria-expanded", "true");
        $menu.removeClass("offscreen");
        $menu.show();
    }
});

$(document).on("click", function (e) {
    if ($(e.target).closest(".downloadBtn").length === 0) {
        $(".downloadBtn.open").removeClass("open").children("ul.dropdown-menu").hide();
        $(".downloadBtn > #btnGroupDrop1").attr("aria-expanded", "false");
    }
});

(function() {
    var templates = {
        add: _.template(
            $("#template-shelf-add").html()
        ),
        remove: _.template(
            $("#template-shelf-remove").html()
        )
    };

    $("#add-to-shelves, #remove-from-shelves").on("click", "[data-shelf-action]", function (e) {
        e.preventDefault();
        $.ajax({
                url: $(this).data('href'),
                method:"post",
                data: {csrf_token:$("input[name='csrf_token']").val()},
            })
            .done(function() {
                var $this = $(this);
                switch ($this.data("shelf-action")) {
                    case "add":
                        $("#remove-from-shelves").append(
                            templates.remove({
                                add: $this.data('href'),
                                remove: $this.data("remove-href"),
                                content: $("<div>").text(this.textContent).html()
                            })
                        );
                        break;
                    case "remove":
                        $("#add-to-shelves").append(
                            templates.add({
                                add: $this.data("add-href"),
                                remove: $this.data('href'),
                                content: $("<div>").text(this.textContent).html(),
                            })
                        );
                        break;
                }
                this.parentNode.removeChild(this);
            }.bind(this))
            .fail(function(xhr) {
                var $msg = $("<span/>", { "class": "text-danger"}).text(xhr.responseText);
                $("#shelf-action-status").html($msg);

                setTimeout(function() {
                    $msg.remove();
                }, 10000);
            });
    });
})();
