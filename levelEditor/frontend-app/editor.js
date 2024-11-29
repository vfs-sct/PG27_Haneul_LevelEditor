$(function () {
    let blockCounter = 0;

    // Creating blocks
    function createBlock(BlockType, padding) {
        let blockId = `${BlockType}-${blockCounter++}`;
        let block = $("<div></div>")
            .addClass(BlockType)
            .attr("id", blockId)
            .css({ top: "10px", left: padding + "px" })
            .appendTo("#editor");

        // Make the block draggable
        block.draggable({
            containment: "#editor",
            stop: function (event, ui) {
                // You can add stuff here
            }
        });

        // Prevent event propagation when clicking on the block
        block.click(function (event) {
            event.stopPropagation();
        });

        // Show context menu for deletion
        block.contextmenu(function (event) {
            event.preventDefault();
            if (confirm("Delete this block?")) {
                $(this).remove();
            }
        });

        return block;
    }

    // Add block button
    $("#add-block").click(function () {
        createBlock("block", 10);           // Regular block
        createBlock("rectangleBlock", 100); // Rectangle block
        createBlock("triangleBlock", 210);  // Triangle block
    });

    // Load level list
    function loadLevelList() {
        $.ajax({
            url: "http://localhost:3000/levels",
            method: "GET",
            success: function (levelIds) {
                const $levelList = $("#level-list");
                $levelList.empty();
                $levelList.append(`<option value="">Select a Level</option>`);
                levelIds.forEach(function (id) {
                    $levelList.append(`<option value="${id}">${id}</option>`);
                });
            },
            error: function (xhr, status, error) {
                console.error("Error fetching level list:", error);
            }
        });
    }

    // Save the level
    $("#save-level").click(function () {
        const levelId = $("#level-id").val().trim();

        if (!levelId) {
            alert("Please enter a level ID!");
            return;
        }

        const levelData = [];

        $("#block").each(function () {
            const $this = $(this);
            const position = $this.position();
            levelData.push({
                id: $this.attr("id"),
                x: position.left,
                y: position.top,
                width: $this.width(),
                height: $this.height(),
                type: "#block"
            });
        });

        if (levelData.length === 0) {
            alert("The level is empty. Add some blocks before saving.");
            return;
        }

        $.ajax({
            url: `http://localhost:3000/level/` + encodeURIComponent(levelId),
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(levelData),
            success: function (response) {
                alert(response);
                loadLevelList();
            },
            error: function (xhr, status, error) {
                alert("Error saving level: " + xhr.responseText);
            }
        });
    });

    // Load a level
    $("#load-level").click(function () {
        const levelId = $("#level-list").val().trim(); 

        if (!levelId) {
            alert("Please select a level to load!");
            return;
        }

        alert(`Loading level with ID: ${levelId}`);

        $.ajax({
            url: `http://localhost:3000/level/${encodeURIComponent(levelId)}`,
            method: "GET",
            success: function (data) {
                console.log("Level data:", data); 

                if (!Array.isArray(data)) {
                    console.error("Expected an array, but received:", data);
                    alert("Invalid level data format. Please check the server response.");
                    return;
                }

                $("#editor").empty();

                data.forEach(function (blockData) {
                    const blockId = blockData.id;
                    const blockType = blockData.type; 
                    const x = blockData.x;
                    const y = blockData.y;
                    const width = blockData.width;
                    const height = blockData.height;

                    const block = $("<div></div>")
                        .addClass(blockType) 
                        .attr("id", blockId)
                        .css({
                            top: y + "px",
                            left: x + "px",
                            width: width + "px",
                            height: height + "px"
                        })
                        .appendTo("#editor");

                    block.draggable({
                        containment: "#editor",
                        stop: function (event, ui) {
                            
                        }
                    });

                    block.click(function (event) {
                        event.stopPropagation();
                    });

                    block.contextmenu(function (event) {
                        event.preventDefault();
                        if (confirm("Delete this block?")) {
                            $(this).remove();
                        }
                    });
                });
            },
            error: function (xhr, status, error) {
                console.error("Error loading level:", error);
            }
        });
    });

    // Initialize level list
    loadLevelList();
});