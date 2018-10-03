var express = require("express");
var router  = express.Router({mergeParams: true});
var connection = require('../config/database');
var middleware = require("../middleware/index");

// INDEX - show all campgrounds
router.get("/", function(req, res){
    var q = "SELECT * FROM restaurants";
    connection.query(q, function(err, results){
       if (err) throw err;
       res.render("restaurants/index", {restaurants: results, page: 'restaurants'});
    });
});

// CREATE - add new campground to DB
router.post("/",  middleware.isLoggedIn, function(req, res){
   var newRestaurant = {
       name: req.body.name,
       price: req.body.price,
       image_url: req.body.image_url,
       description: req.body.description,
       user_id: req.user.id
   };
   connection.query('INSERT INTO restaurants SET ?', newRestaurant, function(err, result){
       if (err) throw err;
       req.flash("success", "Restaurant created!");
       res.redirect("/restaurants");
   });
});

// NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("restaurants/new"); 
});

// SHOW - shows more info about one campground
// router.get("/:id", function(req, res) {
//   var id = req.params.id;
//   connection.query('SELECT * FROM restaurants INNER JOIN  comments  ON (restaurants.id = comments.restaurant_id) WHERE restaurants.id = ? ',[id], function(err, result){
//       if (err) throw err;
//       res.render("restaurants/show", {restaurant: result, restaurantId: id});
//   });
// });

router.get("/:id", function(req, res){
   var id = req.params.id;
   connection.query('SELECT * FROM restaurants WHERE restaurants.id = ?', [id], function(err, restaurantResult){
      if (err) {
         req.flash("error", "Restaurant not found");
         res.redirect("back");
      } else {
         connection.query('SELECT * FROM comments INNER JOIN users ON (users.id = comments.user_id) WHERE restaurant_id = ?', [id], function(err, commentResult){
            if (err) throw err;
            connection.query('SELECT * FROM restaurants INNER JOIN users ON (users.id = restaurants.user_id) WHERE restaurants.id = ?', [id], function(err, userResult){
               if (err) throw err;
               connection.query('SELECT * FROM comments WHERE restaurant_id = ?', [id], function(err, result){
                  if (err) throw err;
                  res.render("restaurants/show", {restaurant: restaurantResult, comments: commentResult, user: userResult, commentId: result});
               });
            });
         });
      }
   });
});

// Edit Campground Route
router.get("/:id/edit", middleware.checkRestaurantOwnership, function(req, res){
   var id = req.params.id;
   connection.query('SELECT * FROM restaurants WHERE restaurants.id = ?', [id], function(err, result){
      if (err) throw err;
      res.render("restaurants/edit", {restaurant: result});
   });
});

// Update Campground Route
router.put("/:id", function(req, res){
   var id = req.params.id;
   var updatedRestaurant = {
       name: req.body.name,
       price: req.body.price,
       image_url: req.body.image_url,
       description: req.body.description
   };
   
   connection.query('UPDATE restaurants SET ? WHERE id = ?', [updatedRestaurant, id], function(err, result){
      if (err) {
          res.redirect("/restaurants");
      } else {
         req.flash("success", "Restaurant updated!");
          res.redirect("/restaurants/" + id);
      }
   });
});

// Destroy Campground Route
router.delete("/:id", middleware.checkRestaurantOwnership, function(req, res){
   var id = req.params.id;
   connection.query('DELETE FROM restaurants WHERE id = ?', [id], function(err, result){
      if (err) {
          res.redirect("/restaurants");
      } else {
         req.flash("success", "Restaurant deleted!");
          res.redirect("/restaurants");
      }
   });
});


// route middleware to make sure
// function isLoggedIn(req, res, next) {

// 	// if user is authenticated in the session, carry on
// 	if (req.isAuthenticated())
// 		return next();

// 	// if they aren't redirect them to the login page
// 	res.redirect('/login');
// }

module.exports = router;