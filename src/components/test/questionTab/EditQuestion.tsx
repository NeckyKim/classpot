import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router";
import { v4 as uuidv4 } from "uuid";

import { dbService, storageService } from "../../../FirebaseModules";
import { doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, uploadString, deleteObject, ref } from "firebase/storage";

import Choices from "./Choices";

import { toast } from "react-toastify";

import styles from "./EditQuestion.module.css";




export default function EditQuestion({ userCode, setIsEditingQuestion, questionInfo }: {
    userCode: string, 
    setIsEditingQuestion: any,
    questionInfo: any
}) {
    const { testCode } = useParams();

    const [type, setType] = useState<string>(questionInfo.type);
    const [points, setPoints] = useState<number>(questionInfo.points);

    const [question, setQuestion] = useState<string>(questionInfo.question);
    const [answer, setAnswer] = useState<any>(questionInfo.answer);
    const [numberOfAnswers, setNumberOfAnswers] = useState<number>(0);

    const [choices, setChoices] = useState<string[]>(questionInfo.choices);
    const [numberOfChoices, setNumberOfChoices] = useState<number>(Object.values(questionInfo.choices).filter(element => element != "").length);

    const [file, setFile] = useState<string>(questionInfo.imageFile);
    const [imageSize, setImageSize] = useState<number>(questionInfo.imageSize);



    useEffect(() => {
        if (type === "객관식") {
            setNumberOfAnswers(Object.values(answer).filter(element => element === true).length);
        }

        else {
            setNumberOfAnswers(1);
        }
    }, [answer])



    async function editQuestion(event: any) {
        event.preventDefault();

        var fileURL: string = "";

        if (file !== "") {
            const response = await uploadString(ref(storageService, userCode + "/" + testCode + "/" + questionInfo.questionCode), file, "data_url");
            fileURL = await getDownloadURL(response.ref);
        }

        else {
            try {
                await deleteObject(ref(storageService, userCode + "/" + testCode + "/" + questionInfo.questionCode))
            }

            catch (error) {
                console.log(error);
            }
        }

        if (testCode && numberOfAnswers) {
            try {
                await updateDoc(doc(dbService, "tests", testCode, "questions", questionInfo.questionCode), {
                    type: type,
                    points: points,
                    question: question,
                    answer: answer,
                    choices: choices,
                    imageFile: fileURL,
                    imageSize: imageSize
                })

                setIsEditingQuestion(false);
                setQuestion("");
                setAnswer(undefined);

                toast.success("문제가 수정되었습니다.");
            }

            catch (error) {
                console.log(error);
                toast.error("문제 수정에 실패했습니다.");
            }
        }

        else {
            toast.error("객관식 문제는 정답을 적어도 하나 이상 설정해야 합니다.",);
        }
    }



    function onFileChange(event: any) {
        const {
            target: { files }
        } = event;

        const theFile = files[0];

        const reader = new FileReader();

        reader.onloadend = (finishedEvent: any) => {
            const {
                currentTarget: { result },
            } = finishedEvent;

            setFile(result);
        }

        reader.readAsDataURL(theFile);
    }

    const fileInput: any = useRef();



    function onClearFile() {
        setFile("");

        if (fileInput.current) {
            fileInput.current.value = null;
        }
    }



    return (
        <div className={styles.container}>
            <div className={styles.questionHeader}>
                유형
            </div>

            <div className={styles.questionTypeContainer}>
                <div
                    className={type === "객관식" ? styles.questionTypeSelectedLeft : styles.questionTypeNotSelectedLeft}
                    onClick={() => {
                        setType("객관식");
                        setAnswer(new Array(10).fill(false));
                    }}>
                    객관식
                </div>

                <div
                    className={type === "참/거짓" ? styles.questionTypeSelectedMiddle : styles.questionTypeNotSelectedMiddle}
                    onClick={() => {
                        setType("참/거짓");
                        setAnswer(true);
                    }}>
                    참/거짓
                </div>

                <div
                    className={type === "주관식" ? styles.questionTypeSelectedMiddle : styles.questionTypeNotSelectedMiddle}
                    onClick={() => {
                        setType("주관식");
                        setAnswer("");
                    }}>
                    주관식
                </div>

                <div
                    className={type === "서술형" ? styles.questionTypeSelectedRight : styles.questionTypeNotSelectedRight}
                    onClick={() => {
                        setType("서술형");
                        setAnswer("");
                    }}>
                    서술형
                </div>
            </div>



            <form onSubmit={editQuestion}>
                <div className={styles.questionHeader}>
                    배점
                </div>

                <input
                    type="number"
                    min={1}
                    max={100}
                    value={points}
                    onChange={(event) => { setPoints(Number(event.target.value)); }}
                    className={styles.questionPoints}
                    required
                />

                <div className={styles.questionPointsUnit}>
                    점
                </div>



                <div className={styles.questionHeader}>
                    질문
                </div>

                <textarea
                    value={question}
                    onChange={(event) => { setQuestion(event.target.value); }}
                    className={styles.questionBox}
                    spellCheck={false}
                    required
                />



                <div className={styles.questionHeader}>
                    이미지
                </div>

                <div className={styles.imageContainer}>
                    {
                        file

                            ?

                            <div className={styles.imagePreviewContainer}>
                                <img
                                    src={file}
                                    width={imageSize * 200 + "px"}
                                    className={styles.imagePreview}
                                />

                                <div className={styles.imagePreviewContainerBottom}>
                                    <div
                                        className={styles.imageSizeButton}
                                        onClick={() => { setImageSize(1); }}
                                        style={imageSize === 1 ? { backgroundColor: "rgb(0, 100, 250", color: "rgb(255, 255, 255)" } : {}}
                                    >
                                        25%
                                    </div>

                                    <div
                                        className={styles.imageSizeButton}
                                        onClick={() => { setImageSize(2); }}
                                        style={imageSize === 2 ? { backgroundColor: "rgb(0, 100, 250", color: "rgb(255, 255, 255)" } : {}}
                                    >
                                        50%
                                    </div>

                                    <div
                                        className={styles.imageSizeButton}
                                        onClick={() => { setImageSize(3); }}
                                        style={imageSize === 3 ? { backgroundColor: "rgb(0, 100, 250", color: "rgb(255, 255, 255)" } : {}}
                                    >
                                        75%
                                    </div>

                                    <div
                                        className={styles.imageSizeButton}
                                        onClick={() => { setImageSize(4); }}
                                        style={imageSize === 4 ? { backgroundColor: "rgb(0, 100, 250", color: "rgb(255, 255, 255)" } : {}}
                                    >
                                        100%
                                    </div>

                                    <div />

                                    <button
                                        onClick={onClearFile}
                                        className={styles.imageUploadDeleteButton}
                                    >
                                        이미지 삭제
                                    </button>
                                </div>
                            </div>

                            :

                            <div>
                                <label htmlFor="file">
                                    <div className={styles.imageUploadDeleteButton}>
                                        이미지 업로드
                                    </div>
                                </label>

                                <input
                                    type="file"
                                    name="file"
                                    accept="image/*"
                                    id="file"
                                    onChange={onFileChange}
                                    ref={fileInput}
                                    className={styles.imageUploader}
                                />
                            </div>
                    }
                </div>



                {
                    type === "객관식"

                    &&

                    <div>
                        <div className={styles.questionHeader}>
                            선택지
                        </div>

                        <div className={styles.choiceButtonContainer}>
                            <input
                                type="button"
                                value="증가 +"
                                disabled={numberOfChoices === 10}
                                onClick={() => { setNumberOfChoices(numberOfChoices + 1); }}
                                className={styles.choiceButtonUp}
                            />

                            <input
                                type="button"
                                value="감소 -"
                                disabled={numberOfChoices === 3}
                                onClick={() => { setNumberOfChoices(numberOfChoices - 1); }}
                                className={styles.choiceButtonDown}
                            />
                        </div>

                        <div className={styles.choicesContainer}>
                            <Choices index={0} answer={answer} setAnswer={setAnswer} choices={choices} setChoices={setChoices} />
                            <Choices index={1} answer={answer} setAnswer={setAnswer} choices={choices} setChoices={setChoices} />
                            <Choices index={2} answer={answer} setAnswer={setAnswer} choices={choices} setChoices={setChoices} />
                            {numberOfChoices >= 4 && <Choices index={3} answer={answer} setAnswer={setAnswer} choices={choices} setChoices={setChoices} />}
                            {numberOfChoices >= 5 && <Choices index={4} answer={answer} setAnswer={setAnswer} choices={choices} setChoices={setChoices} />}
                            {numberOfChoices >= 6 && <Choices index={5} answer={answer} setAnswer={setAnswer} choices={choices} setChoices={setChoices} />}
                            {numberOfChoices >= 7 && <Choices index={6} answer={answer} setAnswer={setAnswer} choices={choices} setChoices={setChoices} />}
                            {numberOfChoices >= 8 && <Choices index={7} answer={answer} setAnswer={setAnswer} choices={choices} setChoices={setChoices} />}
                            {numberOfChoices >= 9 && <Choices index={8} answer={answer} setAnswer={setAnswer} choices={choices} setChoices={setChoices} />}
                            {numberOfChoices >= 10 && <Choices index={9} answer={answer} setAnswer={setAnswer} choices={choices} setChoices={setChoices} />}
                        </div>
                    </div>
                }

                {
                    type === "참/거짓"

                    &&

                    <div>
                        <div className={styles.questionHeader}>
                            정답
                        </div>



                        <div className={styles.answerContainer}>
                            <div
                                className={answer ? styles.answerTrueSelected : styles.answerTrueNotSelected}
                                onClick={() => { setAnswer(true); }}
                            >
                                참
                            </div>

                            <div
                                className={!answer ? styles.answerFalseSelected : styles.answerFalseNotSelected}
                                onClick={() => { setAnswer(false); }}
                            >
                                거짓
                            </div>
                        </div>
                    </div>

                }

                {
                    type === "주관식"

                    &&

                    <div>
                        <div className={styles.questionHeader}>
                            정답
                        </div>

                        <input
                            type="text"
                            value={answer}
                            onChange={(event) => { setAnswer(event.target.value); }}
                            className={styles.answerBox}
                            required
                        />
                    </div>
                }

                {
                    type === "서술형"

                    &&

                    <div>
                        <div className={styles.questionHeader}>
                            정답
                        </div>

                        <div className={styles.answerBoxUnable}>
                            서술형 문제는 정답을 설정할 수 없습니다.
                        </div>
                    </div>
                }

                <br />

                <input type="submit" value="수정" className={styles.submitButton} />

                <button
                    className={styles.cancelButton}
                    onClick={() => {
                        setIsEditingQuestion(false);
                    }}
                >
                    취소
                </button>
            </form>
        </div>
    )
}