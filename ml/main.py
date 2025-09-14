import speech_recognition as sr
import webbrowser
import pyttsx3
import requests

recognizer = sr.Recognizer()


def speak(text):
    print("unix:", text)
    engine = pyttsx3.init()
    engine.say(text)
    engine.runAndWait()


def processCommand(c):
    if "home" in c.lower():
        speak("Opening Home page!")
        webbrowser.open("http://localhost:5173/")
    elif "dashboard" in c.lower():
        speak("Opening Dashboard!")
        webbrowser.open("http://localhost:5173/dashboard")
    elif "found waste" in c.lower():
        speak("Opening Waste Upload page!")
        webbrowser.open("http://localhost:5173/waste-upload")
    elif "upload" in c.lower():
        speak("Opening Waste Upload Page!")
        webbrowser.open("http://localhost:5173/waste-upload")
    elif "learn" in c.lower():
        speak("Opening Learning page!")
        webbrowser.open("http://localhost:5173/learning")
    elif "contest" in c.lower():
        speak("Opening Weekly Contest!")
        webbrowser.open("http://localhost:5173/social-feed")
    elif "social" in c.lower():
        speak("Opening Weekly Contest!")
        webbrowser.open("http://localhost:5173/social-feed")
    elif "shop" in c.lower():
        speak("Opening Shopping page!")
        webbrowser.open("http://localhost:5173/shop")
    elif "buy" in c.lower():
        speak("Opening Shopping page!")
        webbrowser.open("http://localhost:5173/shop")
    elif "sell" in c.lower():
        speak("Opening Shopping page!")
        webbrowser.open("http://localhost:5173/shop/sell")
    elif "logout" in c.lower():
        speak("Logging Out!")
        webbrowser.open("http://localhost:5173/login")
    else:
        speak("Unable to work on the command")

if __name__ == "__main__":
    speak("Initializing unix....")
    while True:
        try:
            with sr.Microphone() as source:
                recognizer.adjust_for_ambient_noise(source, duration=2)
                print("Listening for wake word...")
                audio = recognizer.listen(source, timeout=2, phrase_time_limit=2)

            word = recognizer.recognize_google(audio)
            print("You said:", word)

            if "unix" in word.lower():
                print("Wake word detected!")
                speak("Yes, I am listening.")

                with sr.Microphone() as source:
                    recognizer.adjust_for_ambient_noise(source, duration=1)
                    speak("How may i help you ?")
                    print("Listening for command...")
                    audio = recognizer.listen(source, timeout=2, phrase_time_limit=2)

                command = recognizer.recognize_google(audio)
                print("Command:", command)
                processCommand(command)

        except sr.WaitTimeoutError:
            print("No speech detected (timeout).")
        except sr.UnknownValueError:
            print("Sorry, could not understand audio.")
        except sr.RequestError as e:
            print("Could not request results; check internet.", e)
        except Exception as e:
            print("Unexpected error:", type(e).__name__, "-", e)