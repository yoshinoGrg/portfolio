<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
    String message = "No cookie found. Please enter your name and location.";
    
    // Handle form submission
    if ("POST".equalsIgnoreCase(request.getMethod())) {
        String name = request.getParameter("name");
        String location = request.getParameter("location");
        
        if (name != null && location != null) {
            Cookie nameCookie = new Cookie("userName", java.net.URLEncoder.encode(name, "UTF-8"));
            Cookie locationCookie = new Cookie("userLocation", java.net.URLEncoder.encode(location, "UTF-8"));
            
            // Set 30 days expiry
            nameCookie.setMaxAge(86400 * 30);
            locationCookie.setMaxAge(86400 * 30);
            
            response.addCookie(nameCookie);
            response.addCookie(locationCookie);
            
            response.sendRedirect("cookie_tracker.jsp");
            return;
        }
    }
    
    // Check for existing cookies
    Cookie[] cookies = request.getCookies();
    String savedName = null;
    String savedLocation = null;
    
    if (cookies != null) {
        for (Cookie cookie : cookies) {
            if ("userName".equals(cookie.getName())) {
                savedName = java.net.URLDecoder.decode(cookie.getValue(), "UTF-8");
            }
            if ("userLocation".equals(cookie.getName())) {
                savedLocation = java.net.URLDecoder.decode(cookie.getValue(), "UTF-8");
            }
        }
    }
    
    if (savedName != null && savedLocation != null) {
        message = "Welcome back, " + savedName + "! We see your location is set to: " + savedLocation + ".";
    }
%>
<!DOCTYPE html>
<html>
<head>
    <title>JSP Cookie Tracker</title>
    <style>
        body { font-family: sans-serif; background: #0f0f13; color: #ccc8e8; margin: 50px; }
        .card { background: rgba(15, 15, 19, 0.7); padding: 30px; border-radius: 15px; border: 1px solid rgba(255, 255, 255, 0.05); }
        input { padding: 10px; margin: 10px 0; border-radius: 5px; border: none; }
        button { padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="card">
        <h2>JSP Cookie Tracker</h2>
        <p><%= message %></p>
        
        <form method="POST" action="cookie_tracker.jsp">
            <label>Name:</label><br>
            <input type="text" name="name" required><br>
            <label>Location:</label><br>
            <input type="text" name="location" required><br>
            <button type="submit">Save to Cookie</button>
        </form>
    </div>
</body>
</html>
